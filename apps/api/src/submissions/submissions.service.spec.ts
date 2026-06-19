import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateIntakeDto } from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let supabaseService: { getClient: jest.Mock };

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
    {
      id: 'q-years',
      field_key: 'years_studying_english',
      type: 'number',
      is_required: false,
    },
  ];

  const dto: CreateIntakeDto = {
    formSlug: 'student-intake',
    locale: 'es',
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
      { questionId: 'q-years', value: '3' },
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
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
    supabaseService = module.get(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a submission atomically through the database RPC', async () => {
    const rpcSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        student_id: 'student-1',
        program: dto.program,
        created_at: '2026-06-05T01:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ single: rpcSingle });
    const from = buildIntakeLookupFromMock();

    supabaseService.getClient.mockReturnValue({ from, rpc });

    await expect(service.create(dto)).resolves.toMatchObject({
      id: 'submission-1',
      student_id: 'student-1',
      program: dto.program,
    });
    expect(rpc).toHaveBeenCalledWith('create_intake_submission', {
      p_form_slug: form.slug,
      p_name: dto.name,
      p_email: dto.email,
      p_phone: dto.phone,
      p_program: dto.program,
      p_locale: dto.locale,
      p_answers: [
        {
          questionId: 'q-name',
          fieldKey: 'name',
          questionType: 'text',
          answer: 'Jane Smith',
        },
        {
          questionId: 'q-email',
          fieldKey: 'email',
          questionType: 'email',
          answer: 'jane@example.com',
        },
        {
          questionId: 'q-phone',
          fieldKey: 'phone',
          questionType: 'tel',
          answer: '5551234567',
        },
        {
          questionId: 'q-program',
          fieldKey: 'program',
          questionType: 'select',
          answer: 'Intensive English Program',
        },
        {
          questionId: 'q-prior-study',
          fieldKey: 'has_studied_english_before',
          questionType: 'boolean',
          answer: true,
        },
        {
          questionId: 'q-years',
          fieldKey: 'years_studying_english',
          questionType: 'number',
          answer: 3,
        },
      ],
    });
  });

  it('defaults the RPC locale to English when none is submitted', async () => {
    const rpcSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'submission-1',
        student_id: 'student-1',
        program: dto.program,
        created_at: '2026-06-05T01:00:00.000Z',
      },
      error: null,
    });
    const rpc = jest.fn().mockReturnValue({ single: rpcSingle });
    const from = buildIntakeLookupFromMock();

    supabaseService.getClient.mockReturnValue({ from, rpc });

    await service.create({ ...dto, locale: undefined });
    expect(rpc).toHaveBeenCalledWith(
      'create_intake_submission',
      expect.objectContaining({
        p_locale: 'en',
      }),
    );
  });

  it('throws when a required question is missing before calling the RPC', async () => {
    const rpc = jest.fn();
    const from = buildIntakeLookupFromMock();

    supabaseService.getClient.mockReturnValue({ from, rpc });

    await expect(
      service.create({
        ...dto,
        answers: dto.answers.filter(
          (answer) => answer.questionId !== 'q-prior-study',
        ),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('throws when an answer does not belong to the selected form', async () => {
    const rpc = jest.fn();
    const from = buildIntakeLookupFromMock();

    supabaseService.getClient.mockReturnValue({ from, rpc });

    await expect(
      service.create({
        ...dto,
        answers: [
          ...dto.answers,
          { questionId: 'question-from-other-form', value: 'Nope' },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('throws when the database transaction fails', async () => {
    const rpcSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'insert failed' },
    });
    const rpc = jest.fn().mockReturnValue({ single: rpcSingle });
    const from = buildIntakeLookupFromMock();

    supabaseService.getClient.mockReturnValue({ from, rpc });

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  function buildIntakeLookupFromMock() {
    const intakeQuestionsOrder = jest
      .fn()
      .mockResolvedValue({ data: questions, error: null });
    const intakeQuestionsEq = jest
      .fn()
      .mockReturnValue({ order: intakeQuestionsOrder });
    const intakeQuestionsSelect = jest
      .fn()
      .mockReturnValue({ eq: intakeQuestionsEq });
    const intakeFormsMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: form, error: null });
    const intakeFormsEq = jest.fn().mockReturnValue({
      maybeSingle: intakeFormsMaybeSingle,
    });
    const intakeFormsSelect = jest.fn().mockReturnValue({ eq: intakeFormsEq });

    return jest.fn((table: string) => {
      switch (table) {
        case 'intake_forms':
          return { select: intakeFormsSelect };
        case 'intake_questions':
          return { select: intakeQuestionsSelect };
        default:
          throw new Error(`Unexpected table: ${table}`);
      }
    });
  }
});
