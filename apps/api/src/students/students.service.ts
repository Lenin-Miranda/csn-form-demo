import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/students.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateStudentDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('students')
      .insert({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        this.logger.warn(`Student already exists for email: ${dto.email}`);
        throw new ConflictException('Student already exists');
      }

      this.logger.error('Failed to create student', error.message);
      throw new InternalServerErrorException('Could not create student');
    }

    this.logger.log(`Student created with id: ${data.id}`);
    return data;
  }

  async findOrCreate(dto: CreateStudentDto) {
    const supabase = this.supabaseService.getClient();

    const { data: existingStudent, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', dto.email)
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to look up student', error.message);
      throw new InternalServerErrorException('Could not look up student');
    }

    if (existingStudent) {
      this.logger.log(`Reusing existing student with id: ${existingStudent.id}`);
      return existingStudent;
    }

    return this.create(dto);
  }
}
