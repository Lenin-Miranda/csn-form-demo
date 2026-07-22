import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendMailService } from '../integrations/resend/resend-mail.service';
import { MailService } from './mail.service';
import { NoopMailService } from './noop-mail.service';

@Module({
  providers: [
    NoopMailService,
    ResendMailService,
    {
      provide: MailService,
      inject: [ConfigService, NoopMailService, ResendMailService],
      useFactory: (
        configService: ConfigService,
        noopMailService: NoopMailService,
        resendMailService: ResendMailService,
      ) => {
        const provider = (
          configService.get<string>('MAIL_PROVIDER') ?? 'resend'
        )
          .trim()
          .toLowerCase();

        if (provider === 'noop') {
          return noopMailService;
        }

        if (provider === 'resend') {
          return resendMailService;
        }

        throw new Error(`Unsupported MAIL_PROVIDER: ${provider}`);
      },
    },
  ],
  exports: [MailService],
})
export class MailModule {}
