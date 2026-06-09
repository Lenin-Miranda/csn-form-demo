import { Injectable, Logger } from '@nestjs/common';
import {
  EmailJobsService,
  EnqueueSubmissionConfirmationPayload,
} from './email-jobs.service';

@Injectable()
export class NoopEmailJobsService extends EmailJobsService {
  private readonly logger = new Logger(NoopEmailJobsService.name);

  async enqueueSubmissionConfirmation(
    payload: EnqueueSubmissionConfirmationPayload,
  ): Promise<void> {
    this.logger.log(
      `Email confirmation job queued for ${payload.studentEmail}`,
    );
  }
}
