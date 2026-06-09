export interface SendSubmissionConfirmationPayload {
  to: string;
  studentName: string;
  program: string;
  formSlug: string;
  submissionId: string;
  locale?: 'en' | 'es';
}

export abstract class MailService {
  abstract sendSubmissionConfirmation(
    payload: SendSubmissionConfirmationPayload,
  ): Promise<void>;
}
