import { Injectable, Logger } from '@nestjs/common';
import { MailService, SendSubmissionConfirmationPayload } from './mail.service';

@Injectable()
export class NoopMailService extends MailService {
  private readonly logger = new Logger(NoopMailService.name);

  async sendSubmissionConfirmation(
    payload: SendSubmissionConfirmationPayload,
  ): Promise<string> {
    this.logger.log(`Submission confirmation email skipped for ${payload.to}`);
    return `noop-${payload.submissionId}`;
  }
}
