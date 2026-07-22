import { Module } from '@nestjs/common';
import { EmailJobsService } from './email-jobs.service';
import { DatabaseEmailJobsService } from './database-email.jobs.service';
import { MailModule } from '../mail/mail.module';
import { EmailJobsProcessorService } from './email-jobs-processor.service';
import { EmailJobsRunnerService } from './email-jobs-runner.service';
import { EmailJobsController } from './email-jobs.controller';

@Module({
  imports: [MailModule],
  providers: [
    {
      provide: EmailJobsService,
      useClass: DatabaseEmailJobsService,
    },
    EmailJobsProcessorService,
    EmailJobsRunnerService,
  ],
  exports: [EmailJobsService, EmailJobsProcessorService],
  controllers: [EmailJobsController],
})
export class EmailJobsModule {}
