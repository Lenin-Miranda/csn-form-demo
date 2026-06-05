import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateIntakeDto } from './dto/submission.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { StudentsService } from '../students/students.service';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly studentsService: StudentsService,
  ) {}

  async create(dto: CreateIntakeDto) {
    const student = await this.studentsService.findOrCreate({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        student_id: student.id,
        program: dto.program,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Failed to create submission', error.message);
      throw new InternalServerErrorException('Could not create submission');
    }

    this.logger.log(`Submission created with id: ${data.id}`);
    return data;
  }
}
