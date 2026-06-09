import { Module } from '@nestjs/common';
import { EmailJobsService } from './email-jobs.service';
import { DatabaseEmailJobsService } from './database-email.jobs.service';

@Module({
  providers: [
    {
      provide: EmailJobsService,
      useClass: DatabaseEmailJobsService,
    },
  ],
  exports: [EmailJobsService],
})
export class EmailJobsModule {}
