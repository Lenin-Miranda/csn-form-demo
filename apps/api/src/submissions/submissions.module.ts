import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { StudentsModule } from '../students/students.module';
import { EmailJobsModule } from '../email-jobs/email-jobs.module';

@Module({
  imports: [StudentsModule, EmailJobsModule],
  providers: [SubmissionsService],
  controllers: [SubmissionsController],
})
export class SubmissionsModule {}
