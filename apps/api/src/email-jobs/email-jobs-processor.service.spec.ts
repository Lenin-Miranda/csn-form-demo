import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailJobsProcessorService } from './email-jobs-processor.service';

describe('EmailJobsProcessorService', () => {
  let service: EmailJobsProcessorService;
  let supabaseService: { getClient: jest.Mock };
  let mailService: { sendSubmissionConfirmation: jest.Mock };

  const job = {
    id: 'job-1',
    submission_id: 'submission-1',
    template: 'submission_confirmation',
    recipient_email: 'jane@example.com',
    payload: {
      submissionId: 'submission-1',
      formSlug: 'student-intake',
      studentName: 'Jane Smith',
      studentEmail: 'jane@example.com',
      program: 'Intensive English Program',
    },
    attempts: 0,
    status: 'pending',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailJobsProcessorService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendSubmissionConfirmation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailJobsProcessorService>(EmailJobsProcessorService);
    supabaseService = module.get(SupabaseService);
    mailService = module.get(MailService);
  });

  it('does nothing when there are no pending jobs', async () => {
    const from = jest.fn().mockReturnValue(
      buildFetchPendingChain({
        data: [],
        error: null,
      }),
    );

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.processPending()).resolves.toBeUndefined();
    expect(mailService.sendSubmissionConfirmation).not.toHaveBeenCalled();
  });

  it('marks a pending job as sent when delivery succeeds', async () => {
    const from = jest
      .fn()
      .mockReturnValueOnce(
        buildFetchPendingChain({
          data: [job],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        buildClaimJobChain({
          data: { id: job.id },
          error: null,
        }),
      )
      .mockReturnValueOnce(
        buildClaimJobChain({
          error: null,
          data: { id: job.id },
        }),
      );

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.processPending()).resolves.toBeUndefined();
    expect(mailService.sendSubmissionConfirmation).toHaveBeenCalledWith({
      to: job.recipient_email,
      studentName: job.payload.studentName,
      program: job.payload.program,
      formSlug: job.payload.formSlug,
      submissionId: job.payload.submissionId,
      locale: undefined,
    });
  });

  it('re-queues a job when delivery fails before max attempts', async () => {
    const retryUpdate = buildClaimJobChain({
      data: { id: job.id },
      error: null,
    });
    const from = jest
      .fn()
      .mockReturnValueOnce(
        buildFetchPendingChain({
          data: [job],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        buildClaimJobChain({
          data: { id: job.id },
          error: null,
        }),
      )
      .mockReturnValueOnce(retryUpdate);

    supabaseService.getClient.mockReturnValue({ from });
    mailService.sendSubmissionConfirmation.mockRejectedValue(
      new Error('provider timeout'),
    );

    await expect(service.processPending()).resolves.toBeUndefined();
    expect(mailService.sendSubmissionConfirmation).toHaveBeenCalledTimes(1);
    expect(retryUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: 1,
        status: 'pending',
      }),
    );
  });

  it('marks a job as failed after the max number of attempts', async () => {
    const maxAttemptJob = {
      ...job,
      attempts: 2,
    };
    const failureUpdate = buildClaimJobChain({
      data: { id: maxAttemptJob.id },
      error: null,
    });
    const from = jest
      .fn()
      .mockReturnValueOnce(
        buildFetchPendingChain({
          data: [maxAttemptJob],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        buildClaimJobChain({
          data: { id: maxAttemptJob.id },
          error: null,
        }),
      )
      .mockReturnValueOnce(failureUpdate);

    supabaseService.getClient.mockReturnValue({ from });
    mailService.sendSubmissionConfirmation.mockRejectedValue(
      new Error('provider timeout'),
    );

    await expect(service.processPending()).resolves.toBeUndefined();
    expect(failureUpdate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: 3,
        status: 'failed',
      }),
    );
  });

  it('throws when pending jobs cannot be loaded', async () => {
    const from = jest.fn().mockReturnValue(
      buildFetchPendingChain({
        data: null,
        error: { message: 'permission denied' },
      }),
    );

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.processPending()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});

function buildFetchPendingChain(result: {
  data: unknown;
  error: { message: string } | null;
}) {
  const limit = jest.fn().mockResolvedValue(result);
  const order = jest.fn().mockReturnValue({ limit });
  const eq = jest.fn().mockReturnValue({ order });
  const select = jest.fn().mockReturnValue({ eq });

  return {
    select,
  };
}

function buildClaimJobChain(result: {
  data: unknown;
  error: { message: string } | null;
}) {
  const maybeSingle = jest.fn().mockResolvedValue(result);
  const select = jest.fn().mockReturnValue({ maybeSingle });
  const secondEq = jest.fn().mockReturnValue({ select });
  const firstEq = jest.fn().mockReturnValue({ eq: secondEq });
  const update = jest.fn().mockReturnValue({ eq: firstEq });

  return {
    update,
  };
}
