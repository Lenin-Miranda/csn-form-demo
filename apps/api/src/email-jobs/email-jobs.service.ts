export interface EnqueueSubmissionConfirmationPayload {
  submissionId: string;
  formSlug: string;
  studentName: string;
  studentEmail: string;
  program: string;
}

export abstract class EmailJobsService {
  abstract enqueueSubmissionConfirmation(
    payload: EnqueueSubmissionConfirmationPayload,
  ): Promise<void>;
}
