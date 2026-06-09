import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailJobsService } from '../email-jobs/email-jobs.service';
import { SupabaseService } from '../supabase/supabase.service';
import { StudentsService } from '../students/students.service';
import { CreateIntakeDto } from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let supabaseService: { getClient: jest.Mock };
  let studentsService: { findOrCreate: jest.Mock };
  let emailJobsService: { enqueueSubmissionConfirmation: jest.Mock };

  const student = {
    id: 'student-1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '5551234567',
    created_at: '2026-06-05T00:00:00.000Z',
  };

  const form = {
    id: 'form-1',
    slug: 'student-intake',
  };

  const questions = [
    { id: 'q-name', field_key: 'name', type: 'text', is_required: true },
    { id: 'q-email', field_key: 'email', type: 'email', is_required: true },
    { id: 'q-phone', field_key: 'phone', type: 'tel', is_required: true },
    { id: 'q-program', field_key: 'program', type: 'select', is_required: true },
    {
      id: 'q-prior-study',
      field_key: 'has_studied_english_before',
      type: 'boolean',
      is_required: true,
    },
  ];

  const dto: CreateIntakeDto = {
    formSlug: 'student-intake',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '5551234567',
    program: 'Intensive English Program',
    answers: [
      { questionId: 'q-name', value: 'Jane Smith' },
      { questionId: 'q-email', value: 'jane@example.com' },
      { questionId: 'q-phone', value: '5551234567' },
      { questionId: 'q-program', value: 'Intensive English Program' },
      { questionId: 'q-prior-study', value: 'true' },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
        {
          provide: StudentsService,
          useValue: {
            findOrCreate: jest.fn(),
          },
        },
        {
          provide: EmailJobsService,
          useValue: {
            enqueueSubmissionConfirmation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    supabaseService = module.get(SupabaseService);
    studentsService = module.get(StudentsService);
    emailJobsService = module.get(EmailJobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a submission and stores the dynamic answers', async () => {
    const submissionAnswersInsert = jest.fn().mockResolvedValue({ error: null });
    const submissionSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        student_id: student.id,
        program: dto.program,
        created_at: '2026-06-05T01:00:00.000Z',
      },
      error: null,
    });
    const submissionSelect = jest.fn().mockReturnValue({ single: submissionSingle });
    const submissionInsert = jest.fn().mockReturnValue({ select: submissionSelect });
    const intakeQuestionsOrder = jest
      .fn()
      .mockResolvedValue({ data: questions, error: null });
    const intakeQuestionsEq = jest.fn().mockReturnValue({ order: intakeQuestionsOrder });
    const intakeQuestionsSelect = jest.fn().mockReturnValue({ eq: intakeQuestionsEq });
    const intakeFormsMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: form, error: null });
    const intakeFormsEq = jest.fn().mockReturnValue({
      maybeSingle: intakeFormsMaybeSingle,
    });
    const intakeFormsSelect = jest.fn().mockReturnValue({ eq: intakeFormsEq });
    const from = jest.fn((table: string) => {
      switch (table) {
        case 'intake_forms':
          return { select: intakeFormsSelect };
        case 'intake_questions':
          return { select: intakeQuestionsSelect };
        case 'submissions':
          return { insert: submissionInsert };
        case 'submission_answers':
          return { insert: submissionAnswersInsert };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    supabaseService.getClient.mockReturnValue({ from });
    studentsService.findOrCreate.mockResolvedValue(student);

    await expect(service.create(dto)).resolves.toMatchObject({
      id: 'submission-1',
      student_id: student.id,
      program: dto.program,
    });
    expect(
      emailJobsService.enqueueSubmissionConfirmation,
    ).toHaveBeenCalledWith({
      submissionId: 'submission-1',
      formSlug: dto.formSlug,
      studentName: dto.name,
      studentEmail: dto.email,
      program: dto.program,
    });
    expect(submissionAnswersInsert).toHaveBeenCalledWith([
      {
        submission_id: 'submission-1',
        question_id: 'q-name',
        field_key: 'name',
        question_type: 'text',
        answer: 'Jane Smith',
      },
      {
        submission_id: 'submission-1',
        question_id: 'q-email',
        field_key: 'email',
        question_type: 'email',
        answer: 'jane@example.com',
      },
      {
        submission_id: 'submission-1',
        question_id: 'q-phone',
        field_key: 'phone',
        question_type: 'tel',
        answer: '5551234567',
      },
      {
        submission_id: 'submission-1',
        question_id: 'q-program',
        field_key: 'program',
        question_type: 'select',
        answer: 'Intensive English Program',
      },
      {
        submission_id: 'submission-1',
        question_id: 'q-prior-study',
        field_key: 'has_studied_english_before',
        question_type: 'boolean',
        answer: true,
      },
    ]);
  });

  it('throws when a required question is missing', async () => {
    const intakeQuestionsOrder = jest
      .fn()
      .mockResolvedValue({ data: questions, error: null });
    const intakeQuestionsEq = jest.fn().mockReturnValue({ order: intakeQuestionsOrder });
    const intakeQuestionsSelect = jest.fn().mockReturnValue({ eq: intakeQuestionsEq });
    const intakeFormsMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: form, error: null });
    const intakeFormsEq = jest.fn().mockReturnValue({
      maybeSingle: intakeFormsMaybeSingle,
    });
    const intakeFormsSelect = jest.fn().mockReturnValue({ eq: intakeFormsEq });
    const from = jest.fn((table: string) => {
      switch (table) {
        case 'intake_forms':
          return { select: intakeFormsSelect };
        case 'intake_questions':
          return { select: intakeQuestionsSelect };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.create({
        ...dto,
        answers: dto.answers.filter((answer) => answer.questionId !== 'q-prior-study'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(emailJobsService.enqueueSubmissionConfirmation).not.toHaveBeenCalled();
  });

  it('throws when submission answers cannot be inserted', async () => {
    const submissionAnswersInsert = jest
      .fn()
      .mockResolvedValue({ error: { message: 'insert failed' } });
    const submissionSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        student_id: student.id,
        program: dto.program,
        created_at: '2026-06-05T01:00:00.000Z',
      },
      error: null,
    });
    const submissionSelect = jest.fn().mockReturnValue({ single: submissionSingle });
    const submissionInsert = jest.fn().mockReturnValue({ select: submissionSelect });
    const intakeQuestionsOrder = jest
      .fn()
      .mockResolvedValue({ data: questions, error: null });
    const intakeQuestionsEq = jest.fn().mockReturnValue({ order: intakeQuestionsOrder });
    const intakeQuestionsSelect = jest.fn().mockReturnValue({ eq: intakeQuestionsEq });
    const intakeFormsMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: form, error: null });
    const intakeFormsEq = jest.fn().mockReturnValue({
      maybeSingle: intakeFormsMaybeSingle,
    });
    const intakeFormsSelect = jest.fn().mockReturnValue({ eq: intakeFormsEq });
    const from = jest.fn((table: string) => {
      switch (table) {
        case 'intake_forms':
          return { select: intakeFormsSelect };
        case 'intake_questions':
          return { select: intakeQuestionsSelect };
        case 'submissions':
          return { insert: submissionInsert };
        case 'submission_answers':
          return { insert: submissionAnswersInsert };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    supabaseService.getClient.mockReturnValue({ from });
    studentsService.findOrCreate.mockResolvedValue(student);

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(emailJobsService.enqueueSubmissionConfirmation).not.toHaveBeenCalled();
  });

  it('throws when the email job cannot be enqueued', async () => {
    const submissionAnswersInsert = jest.fn().mockResolvedValue({ error: null });
    const submissionSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        student_id: student.id,
        program: dto.program,
        created_at: '2026-06-05T01:00:00.000Z',
      },
      error: null,
    });
    const submissionSelect = jest.fn().mockReturnValue({ single: submissionSingle });
    const submissionInsert = jest.fn().mockReturnValue({ select: submissionSelect });
    const intakeQuestionsOrder = jest
      .fn()
      .mockResolvedValue({ data: questions, error: null });
    const intakeQuestionsEq = jest.fn().mockReturnValue({ order: intakeQuestionsOrder });
    const intakeQuestionsSelect = jest.fn().mockReturnValue({ eq: intakeQuestionsEq });
    const intakeFormsMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: form, error: null });
    const intakeFormsEq = jest.fn().mockReturnValue({
      maybeSingle: intakeFormsMaybeSingle,
    });
    const intakeFormsSelect = jest.fn().mockReturnValue({ eq: intakeFormsEq });
    const from = jest.fn((table: string) => {
      switch (table) {
        case 'intake_forms':
          return { select: intakeFormsSelect };
        case 'intake_questions':
          return { select: intakeQuestionsSelect };
        case 'submissions':
          return { insert: submissionInsert };
        case 'submission_answers':
          return { insert: submissionAnswersInsert };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });

    supabaseService.getClient.mockReturnValue({ from });
    studentsService.findOrCreate.mockResolvedValue(student);
    emailJobsService.enqueueSubmissionConfirmation.mockRejectedValue(
      new InternalServerErrorException('Could not enqueue submission confirmation'),
    );

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });
});
