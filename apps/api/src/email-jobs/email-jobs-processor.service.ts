import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { SupabaseService } from '../supabase/supabase.service';
import {
  DEFAULT_EMAIL_JOB_BATCH_SIZE,
  EMAIL_JOB_MAX_ATTEMPTS,
  EMAIL_JOB_STATUS_FAILED,
  EMAIL_JOB_STATUS_PENDING,
  EMAIL_JOB_STATUS_PROCESSING,
  EMAIL_JOB_STATUS_SENT,
  EMAIL_JOBS_TABLE,
  SUBMISSION_CONFIRMATION_TEMPLATE,
} from './email-jobs.constants';
import { EnqueueSubmissionConfirmationPayload } from './email-jobs.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

interface EmailJobRow {
  id: string;
  submission_id: string;
  template: string;
  recipient_email: string;
  payload: EnqueueSubmissionConfirmationPayload & {
    locale?: 'en' | 'es';
  };
  attempts: number;
  status: string;
}

@Injectable()
export class EmailJobsProcessorService {
  private readonly logger = new Logger(EmailJobsProcessorService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly mailService: MailService,
  ) {}

  async processPending(
    limit = DEFAULT_EMAIL_JOB_BATCH_SIZE,
  ): Promise<void | number> {
    const batchSize =
      Number.isInteger(limit) && limit > 0
        ? limit
        : DEFAULT_EMAIL_JOB_BATCH_SIZE;
    const jobs = await this.fetchPendingJobs(batchSize);
    let processed = 0;

    if (jobs.length === 0) {
      this.logger.log('No pending email jobs found');
      return;
    }

    for (const job of jobs) {
      await this.processJob(job);
      processed += 1;
    }

    this.logger.log(`Processed jobs ${processed}`);
    return processed;
  }

  private async fetchPendingJobs(limit: number): Promise<EmailJobRow[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from(EMAIL_JOBS_TABLE)
      .select(
        'id, submission_id, template, recipient_email, payload, attempts, status',
      )
      .eq('status', EMAIL_JOB_STATUS_PENDING)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      this.logger.error('Failed to load pending email jobs', error.message);
      throw new InternalServerErrorException(
        'Could not load pending email jobs',
      );
    }

    return (data ?? []) as EmailJobRow[];
  }

  private async processJob(job: EmailJobRow): Promise<void> {
    let claimed = false;

    try {
      claimed = await this.markAsProcessing(job.id);
    } catch (error) {
      this.logger.error(
        `Failed to claim email job ${job.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      return;
    }

    if (!claimed) {
      this.logger.warn(`Email job ${job.id} was already claimed`);
      return;
    }

    try {
      await this.deliverJob(job);
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);

      this.logger.error(
        `Failed to process email job ${job.id}`,
        error instanceof Error ? error.stack : undefined,
      );

      await this.handleProcessingFailure(job, errorMessage);
      return;
    }

    try {
      await this.markAsSent(job.id);
      this.logger.log(`Email job ${job.id} marked as sent`);
    } catch (error) {
      this.logger.error(
        `Email job ${job.id} was delivered but could not be finalized`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async findJobById(id: string): Promise<EmailJobRow | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from(EMAIL_JOBS_TABLE)
      .select(
        'id, submission_id, template, recipient_email, payload, attempts, status',
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to load email job ${id}`, error.message);
      throw new InternalServerErrorException('Could not load email job');
    }

    this.logger.log(`Job found for id: ${id}`);
    return (data as EmailJobRow | null) ?? null;
  }

  async processById(id: string): Promise<void> {
    const job = await this.findJobById(id);

    if (!job) {
      throw new NotFoundException(`Email job not found ${id}`);
    }

    await this.processJob(job);
  }

  private async markAsProcessing(jobId: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from(EMAIL_JOBS_TABLE)
      .update({ status: EMAIL_JOB_STATUS_PROCESSING })
      .eq('id', jobId)
      .eq('status', EMAIL_JOB_STATUS_PENDING)
      .select('id')
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to claim email job ${jobId}`, error.message);
      throw new InternalServerErrorException('Could not claim email job');
    }

    return Boolean(data);
  }

  private async deliverJob(job: EmailJobRow): Promise<void> {
    switch (job.template) {
      case SUBMISSION_CONFIRMATION_TEMPLATE:
        await this.mailService.sendSubmissionConfirmation({
          to: job.recipient_email,
          studentName: this.requireString(
            job.payload.studentName,
            'studentName',
          ),
          program: this.requireString(job.payload.program, 'program'),
          formSlug: this.requireString(job.payload.formSlug, 'formSlug'),
          submissionId: this.requireString(
            job.payload.submissionId,
            'submissionId',
          ),
          locale: job.payload.locale,
        });
        return;
      default:
        throw new Error(`Unsupported email template: ${job.template}`);
    }
  }

  private async markAsSent(jobId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from(EMAIL_JOBS_TABLE)
      .update({
        status: EMAIL_JOB_STATUS_SENT,
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', jobId)
      .eq('status', EMAIL_JOB_STATUS_PROCESSING)
      .select('id')
      .maybeSingle();

    if (error || !data) {
      this.logger.error(
        `Email job ${jobId} was delivered but could not be marked as sent`,
        error?.message,
      );
      throw new InternalServerErrorException(
        'Could not mark email job as sent',
      );
    }
  }

  private async handleProcessingFailure(
    job: EmailJobRow,
    errorMessage: string,
  ): Promise<void> {
    const nextAttempts = job.attempts + 1;
    const nextStatus =
      nextAttempts >= EMAIL_JOB_MAX_ATTEMPTS
        ? EMAIL_JOB_STATUS_FAILED
        : EMAIL_JOB_STATUS_PENDING;
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from(EMAIL_JOBS_TABLE)
      .update({
        attempts: nextAttempts,
        last_error: this.truncateErrorMessage(errorMessage),
        sent_at: null,
        status: nextStatus,
      })
      .eq('id', job.id)
      .eq('status', EMAIL_JOB_STATUS_PROCESSING)
      .select('id')
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Failed to update email job ${job.id} after delivery error`,
        error.message,
      );
      return;
    }

    if (!data) {
      this.logger.warn(
        `Email job ${job.id} could not be re-queued because it is no longer processing`,
      );
      return;
    }

    if (nextStatus === EMAIL_JOB_STATUS_FAILED) {
      this.logger.warn(
        `Email job ${job.id} marked as failed after ${nextAttempts} attempts`,
      );
      return;
    }

    this.logger.warn(
      `Email job ${job.id} re-queued after attempt ${nextAttempts}`,
    );
  }

  private requireString(value: string | undefined, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`Email job payload is missing ${field}`);
    }

    return value;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }

    return 'Unknown email job processing error';
  }

  private truncateErrorMessage(message: string): string {
    return message.slice(0, 1000);
  }
}
