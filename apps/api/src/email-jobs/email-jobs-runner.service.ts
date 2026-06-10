import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DEFAULT_EMAIL_JOB_BATCH_SIZE } from './email-jobs.constants';
import { EmailJobsProcessorService } from './email-jobs-processor.service';

const EMAIL_JOBS_PROCESSOR_ENABLED_KEY = 'EMAIL_JOBS_PROCESSOR_ENABLED';
const EMAIL_JOBS_BATCH_SIZE_KEY = 'EMAIL_JOBS_BATCH_SIZE';

@Injectable()
export class EmailJobsRunnerService {
  private readonly logger = new Logger(EmailJobsRunnerService.name);
  private isRunning = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailJobsProcessorService: EmailJobsProcessorService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(): Promise<void> {
    await this.runPendingEmailJobs();
  }

  async runPendingEmailJobs(): Promise<void> {
    if (!this.isProcessorEnabled()) {
      this.logger.debug('Email job processor is disabled by configuration');
      return;
    }

    if (this.isRunning) {
      this.logger.warn(
        'Skipping email job processing because a previous run is still active',
      );
      return;
    }

    this.isRunning = true;

    try {
      await this.emailJobsProcessorService.processPending(this.getBatchSize());
    } catch (error) {
      this.logger.error(
        'Email job processing run failed',
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.isRunning = false;
    }
  }

  private isProcessorEnabled(): boolean {
    const configured = this.configService.get<string>(
      EMAIL_JOBS_PROCESSOR_ENABLED_KEY,
    );

    if (!configured) {
      return true;
    }

    return !['0', 'false', 'no', 'off'].includes(
      configured.trim().toLowerCase(),
    );
  }

  private getBatchSize(): number {
    const configured = this.configService.get<string>(EMAIL_JOBS_BATCH_SIZE_KEY);
    const parsed = configured ? Number.parseInt(configured, 10) : Number.NaN;

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return DEFAULT_EMAIL_JOB_BATCH_SIZE;
    }

    return parsed;
  }
}
