import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { StudentsModule } from './students/students.module';
import { IntakeModule } from './intake/intake.module';
import { EmailJobsModule } from './email-jobs/email-jobs.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    SubmissionsModule,
    StudentsModule,
    IntakeModule,
    EmailJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
