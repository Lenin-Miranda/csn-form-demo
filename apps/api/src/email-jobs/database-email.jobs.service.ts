import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  EmailJobsService,
  EnqueueSubmissionConfirmationPayload,
} from './email-jobs.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  EMAIL_JOBS_TABLE,
  SUBMISSION_CONFIRMATION_TEMPLATE,
} from './email-jobs.constants';

@Injectable()
export class DatabaseEmailJobsService extends EmailJobsService {
  private readonly logger = new Logger(DatabaseEmailJobsService.name);

  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async enqueueSubmissionConfirmation(
    payload: EnqueueSubmissionConfirmationPayload,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from(EMAIL_JOBS_TABLE).insert({
        submission_id: payload.submissionId,
        template: SUBMISSION_CONFIRMATION_TEMPLATE,
        recipient_email: payload.studentEmail,
        payload,
      });

      if (error) {
        if (error.code === '23505') {
          this.logger.warn(
            `Email job already exists for submission ${payload.submissionId} and template ${SUBMISSION_CONFIRMATION_TEMPLATE}`,
          );
          return;
        }

        this.logger.error(
          `Failed to enqueue email job for submission ${payload.submissionId}`,
          error.message,
        );
        throw new InternalServerErrorException(
          'Could not enqueue submission confirmation',
        );
      }

      this.logger.log(
        `Email job queued for submission ${payload.submissionId}`,
      );
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error while enqueueing email job for submission ${payload.submissionId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Could not enqueue submission confirmation',
      );
    }
  }
}
