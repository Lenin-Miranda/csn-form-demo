import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { DatabaseEmailJobsService } from './database-email.jobs.service';

describe('DatabaseEmailJobsService', () => {
  let service: DatabaseEmailJobsService;
  let supabaseService: { getClient: jest.Mock };

  const payload = {
    submissionId: 'submission-1',
    formSlug: 'student-intake',
    studentName: 'Jane Smith',
    studentEmail: 'jane@example.com',
    program: 'Intensive English Program',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseEmailJobsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseEmailJobsService>(DatabaseEmailJobsService);
    supabaseService = module.get(SupabaseService);
  });

  it('inserts a submission confirmation email job', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ insert });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.enqueueSubmissionConfirmation(payload),
    ).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith('email_jobs');
    expect(insert).toHaveBeenCalledWith({
      submission_id: payload.submissionId,
      template: 'submission_confirmation',
      recipient_email: payload.studentEmail,
      payload,
    });
  });

  it('treats duplicate email jobs as idempotent', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value' },
    });
    const from = jest.fn().mockReturnValue({ insert });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.enqueueSubmissionConfirmation(payload),
    ).resolves.toBeUndefined();
  });

  it('throws when the email job cannot be inserted', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: { code: '42501', message: 'permission denied' },
    });
    const from = jest.fn().mockReturnValue({ insert });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.enqueueSubmissionConfirmation(payload),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
