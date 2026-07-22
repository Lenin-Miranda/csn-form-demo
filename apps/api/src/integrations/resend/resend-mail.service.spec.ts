import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ResendMailService } from './resend-mail.service';

const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

describe('ResendMailService', () => {
  let service: ResendMailService;
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    mockSend.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendMailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResendMailService>(ResendMailService);
    configService = module.get(ConfigService);
  });

  it('sends the English submission confirmation through Resend', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'RESEND_API_KEY':
          return 're_test_key';
        case 'MAIL_SENDING_DOMAIN':
          return 'leninmiranda.com';
        case 'MAIL_REPLY_TO':
          return 'hello@leninmiranda.com';
        default:
          return undefined;
      }
    });
    mockSend.mockResolvedValue({
      data: { id: 'email_123' },
      error: null,
    });

    await expect(
      service.sendSubmissionConfirmation({
        to: 'student@example.com',
        studentName: 'Jane Smith',
        program: 'Intensive English Program',
        formSlug: 'student-intake',
        submissionId: 'submission-1',
        locale: 'en',
      }),
    ).resolves.toBeUndefined();

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'CSN English Intake <intake@leninmiranda.com>',
        to: 'student@example.com',
        replyTo: 'hello@leninmiranda.com',
        subject: 'We received your English intake form',
        tags: expect.arrayContaining([
          { name: 'template', value: 'submission_confirmation' },
          { name: 'form_slug', value: 'student-intake' },
          { name: 'locale', value: 'en' },
        ]),
      }),
      {
        idempotencyKey: 'submission-confirmation:submission-1',
      },
    );
  });

  it('uses the Spanish template when locale is es', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'RESEND_API_KEY':
          return 're_test_key';
        case 'MAIL_SENDING_DOMAIN':
          return 'leninmiranda.com';
        default:
          return undefined;
      }
    });
    mockSend.mockResolvedValue({
      data: { id: 'email_456' },
      error: null,
    });

    await service.sendSubmissionConfirmation({
      to: 'student@example.com',
      studentName: 'Jane Smith',
      program: 'Programa intensivo de ingles',
      formSlug: 'student-intake',
      submissionId: 'submission-2',
      locale: 'es',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Recibimos su formulario de admision de ingles',
        tags: expect.arrayContaining([{ name: 'locale', value: 'es' }]),
      }),
      {
        idempotencyKey: 'submission-confirmation:submission-2',
      },
    );
  });

  it('falls back to the admissions identity for unknown forms', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'RESEND_API_KEY':
          return 're_test_key';
        case 'MAIL_SENDING_DOMAIN':
          return 'leninmiranda.com';
        default:
          return undefined;
      }
    });
    mockSend.mockResolvedValue({
      data: { id: 'email_789' },
      error: null,
    });

    await service.sendSubmissionConfirmation({
      to: 'student@example.com',
      studentName: 'Jane Smith',
      program: 'Admissions',
      formSlug: 'general-admissions',
      submissionId: 'submission-3',
      locale: 'en',
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'CSN Admissions <admissions@leninmiranda.com>',
      }),
      expect.any(Object),
    );
  });

  it('throws when Resend cannot send the email', async () => {
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'RESEND_API_KEY':
          return 're_test_key';
        case 'MAIL_SENDING_DOMAIN':
          return 'leninmiranda.com';
        default:
          return undefined;
      }
    });
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'rate limit exceeded' },
    });

    await expect(
      service.sendSubmissionConfirmation({
        to: 'student@example.com',
        studentName: 'Jane Smith',
        program: 'Intensive English Program',
        formSlug: 'student-intake',
        submissionId: 'submission-4',
        locale: 'en',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
