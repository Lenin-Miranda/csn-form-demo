import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/students.dto';
import { SupabaseService } from '../supabase/supabase.service';

const STUDENT_SELECT_FIELDS = 'id, name, email, phone, created_at';

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private async findByEmail(email: string): Promise<StudentRow | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('students')
      .select(STUDENT_SELECT_FIELDS)
      .eq('email', email)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to look up student for email: ${email}`);
      throw new InternalServerErrorException('Could not look up student');
    }

    return data as StudentRow | null;
  }

  async create(dto: CreateStudentDto): Promise<StudentRow> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data, error } = await supabase
        .from('students')
        .insert({
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
        })
        .select(STUDENT_SELECT_FIELDS)
        .single();

      if (error) {
        if (error.code === '23505') {
          this.logger.warn(`Student already exists for email: ${dto.email}`);
          throw new ConflictException('Student already exists');
        }

        this.logger.error('Failed to create student', error.message);
        throw new InternalServerErrorException('Could not create student');
      }

      if (!data) {
        this.logger.error('Supabase returned no student after insert');
        throw new InternalServerErrorException('Could not create student');
      }

      this.logger.log(`Student created with id: ${data.id}`);
      return data;
    } catch (e) {
      if (
        e instanceof ConflictException ||
        e instanceof InternalServerErrorException
      ) {
        throw e;
      }

      this.logger.error(
        `Unexpected error while creating student: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
      throw new InternalServerErrorException('Could not create student');
    }
  }

  async findOrCreate(dto: CreateStudentDto): Promise<StudentRow> {
    try {
      const existingStudent = await this.findByEmail(dto.email);

      if (existingStudent) {
        this.logger.log(
          `Reusing existing student with id: ${existingStudent.id}`,
        );
        return existingStudent;
      }

      this.logger.log(
        `No student found for email: ${dto.email}; creating a new record`,
      );
      return await this.create(dto);
    } catch (e) {
      if (e instanceof ConflictException) {
        this.logger.warn(
          `Student already exists after create attempt for email: ${dto.email}; reloading record`,
        );

        try {
          const student = await this.findByEmail(dto.email);

          if (!student) {
            throw new InternalServerErrorException(
              'Could not find student after conflict',
            );
          }

          this.logger.log(
            `Recovered existing student with id: ${student.id} after conflict`,
          );
          return student;
        } catch (reloadError) {
          this.logger.error(
            `Failed to reload student after conflict for email: ${dto.email}`,
            reloadError instanceof Error ? reloadError.stack : undefined,
          );

          if (reloadError instanceof InternalServerErrorException) {
            throw reloadError;
          }

          throw new InternalServerErrorException(
            'Could not find or create student',
          );
        }
      }

      if (e instanceof InternalServerErrorException) {
        this.logger.error(
          `findOrCreate failed for email: ${dto.email}`,
          e.stack,
        );
        throw e;
      }

      this.logger.error(
        `Unexpected error while finding or creating student for email: ${dto.email}`,
        e instanceof Error ? e.stack : undefined,
      );
      throw new InternalServerErrorException('Could not find or create student');
    }
  }
}
