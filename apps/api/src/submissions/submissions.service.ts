import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateSubmissionDto } from './dto/submission.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateSubmissionDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
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
