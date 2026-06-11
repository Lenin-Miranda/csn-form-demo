import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import {
  MailService,
  SendSubmissionConfirmationPayload,
} from '../../mail/mail.service';
import { buildSubmissionConfirmationEnTemplate } from '../../templates/submission-confirmation.en';
import { buildSubmissionConfirmationEsTemplate } from '../../templates/submission-confirmation.es';

const DEFAULT_MAIL_DOMAIN = 'leninmiranda.com';
const DEFAULT_SENDER_LOCAL_PART = 'intake';
const DEFAULT_REPLY_TO_KEY = 'MAIL_REPLY_TO';
const MAIL_DOMAIN_KEY = 'MAIL_SENDING_DOMAIN';
const RESEND_API_KEY = 'RESEND_API_KEY';

interface MailIdentity {
  from: string;
  replyTo?: string;
}

@Injectable()
export class ResendMailService extends MailService {
  private readonly logger = new Logger(ResendMailService.name);
  private resendClient: Resend | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async sendSubmissionConfirmation(
    payload: SendSubmissionConfirmationPayload,
  ): Promise<string> {
    const locale = payload.locale === 'es' ? 'es' : 'en';
    const template =
      locale === 'es'
        ? buildSubmissionConfirmationEsTemplate(
            payload.studentName,
            payload.program,
          )
        : buildSubmissionConfirmationEnTemplate(
            payload.studentName,
            payload.program,
          );
    const identity = this.resolveMailIdentity(payload.formSlug);
    const resend = this.getClient();
    const { data, error } = await resend.emails.send(
      {
        from: identity.from,
        to: payload.to,
        subject: template.subject,
        text: template.text,
        html: template.html,
        tags: [
          { name: 'template', value: 'submission_confirmation' },
          { name: 'form_slug', value: this.toTagValue(payload.formSlug) },
          {
            name: 'submission_id',
            value: this.toTagValue(payload.submissionId),
          },
          { name: 'locale', value: locale },
        ],
        ...(identity.replyTo ? { replyTo: identity.replyTo } : {}),
      },
      {
        idempotencyKey: `submission-confirmation:${payload.submissionId}`,
      },
    );

    if (error || !data?.id) {
      this.logger.error(
        `Failed to send submission confirmation for submission ${payload.submissionId}`,
        error?.message,
      );
      throw new InternalServerErrorException(
        'Could not send submission confirmation email',
      );
    }

    this.logger.log(
      `Submission confirmation email sent for submission ${payload.submissionId} with Resend id ${data.id}`,
    );

    return data.id;
  }

  private getClient(): Resend {
    if (this.resendClient) {
      return this.resendClient;
    }

    const apiKey = this.configService.get<string>(RESEND_API_KEY)?.trim();

    if (!apiKey) {
      throw new InternalServerErrorException('RESEND_API_KEY is not configured');
    }

    this.resendClient = new Resend(apiKey);
    return this.resendClient;
  }

  private resolveMailIdentity(formSlug: string): MailIdentity {
    const domain =
      this.configService.get<string>(MAIL_DOMAIN_KEY)?.trim() ||
      DEFAULT_MAIL_DOMAIN;
    const replyTo =
      this.configService.get<string>(DEFAULT_REPLY_TO_KEY)?.trim() || undefined;

    switch (formSlug) {
      case 'student-intake':
        return {
          from: `CSN English Intake <${DEFAULT_SENDER_LOCAL_PART}@${domain}>`,
          replyTo,
        };
      default:
        return {
          from: `CSN Admissions <admissions@${domain}>`,
          replyTo,
        };
    }
  }

  private toTagValue(value: string): string {
    const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    return (normalized.length > 0 ? normalized : 'unknown').slice(0, 256);
  }
}
