import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NoopMailService } from './noop-mail.service';

@Module({
  providers: [
    {
      provide: MailService,
      useClass: NoopMailService,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
