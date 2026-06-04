import {
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
      this.logger.error('Failed to create student', error.message);
      throw new InternalServerErrorException('Could not create student');
    }

    this.logger.log(`Student created with id: ${data.id}`);
    return data;
  }
}
