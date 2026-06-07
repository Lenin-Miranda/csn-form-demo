import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { IntakeService } from './intake.service';

describe('IntakeService', () => {
  let service: IntakeService;
  let supabaseService: { getClient: jest.Mock };

  const form = {
    id: 'form-1',
    slug: 'student-intake',
    title: 'CSN English Language Intake',
    description: 'Questions for English learners.',
    is_active: true,
  };

  const currentQuestion = {
    id: '7d31f1bc-2f47-4e3c-b57a-d7b3f1d96011',
    field_key: 'english_level',
    label: 'How would you describe your current English level?',
    type: 'select',
    placeholder: 'Choose your level',
    is_required: true,
    position: 6,
    options: ['Beginner', 'Intermediate'],
    created_at: '2026-06-06T00:00:00.000Z',
  };

  const previousQuestion = {
    id: '2f6965f9-3105-4a4a-a5e7-6326f11eb93a',
    field_key: 'program',
    label: 'Which English program are you most interested in?',
    type: 'select',
    placeholder: 'Choose a program',
    is_required: true,
    position: 5,
    options: ['Intensive English Program'],
    created_at: '2026-06-06T00:00:00.000Z',
  };

  const nextQuestion = {
    id: '1a53fd5a-d073-4f20-bf01-d4ee51c69d29',
    field_key: 'has_studied_english_before',
    label: 'Have you studied English in a classroom before?',
    type: 'boolean',
    placeholder: null,
    is_required: true,
    position: 7,
    options: null,
    created_at: '2026-06-06T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntakeService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IntakeService>(IntakeService);
    supabaseService = module.get(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the previous question for a given question id', async () => {
    const formMaybeSingle = jest.fn().mockResolvedValue({ data: form, error: null });
    const formEq = jest.fn().mockReturnValue({ maybeSingle: formMaybeSingle });
    const formSelect = jest.fn().mockReturnValue({ eq: formEq });

    const currentMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: currentQuestion, error: null });
    const currentEqId = jest.fn().mockReturnValue({ maybeSingle: currentMaybeSingle });
    const currentEqForm = jest.fn().mockReturnValue({ eq: currentEqId });
    const currentSelect = jest.fn().mockReturnValue({ eq: currentEqForm });

    const previousMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: previousQuestion, error: null });
    const previousLimit = jest.fn().mockReturnValue({
      maybeSingle: previousMaybeSingle,
    });
    const previousOrder = jest.fn().mockReturnValue({ limit: previousLimit });
    const previousLt = jest.fn().mockReturnValue({ order: previousOrder });
    const previousEqForm = jest.fn().mockReturnValue({ lt: previousLt });
    const previousSelect = jest.fn().mockReturnValue({ eq: previousEqForm });

    const from = jest
      .fn()
      .mockReturnValueOnce({ select: formSelect })
      .mockReturnValueOnce({ select: currentSelect })
      .mockReturnValueOnce({ select: previousSelect });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.findPreviousQuestion(currentQuestion.id, form.slug),
    ).resolves.toMatchObject({
      questionId: previousQuestion.id,
      fieldKey: previousQuestion.field_key,
      position: previousQuestion.position,
    });
  });

  it('returns null when there is no previous question', async () => {
    const formMaybeSingle = jest.fn().mockResolvedValue({ data: form, error: null });
    const formEq = jest.fn().mockReturnValue({ maybeSingle: formMaybeSingle });
    const formSelect = jest.fn().mockReturnValue({ eq: formEq });

    const currentMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: currentQuestion, error: null });
    const currentEqId = jest.fn().mockReturnValue({ maybeSingle: currentMaybeSingle });
    const currentEqForm = jest.fn().mockReturnValue({ eq: currentEqId });
    const currentSelect = jest.fn().mockReturnValue({ eq: currentEqForm });

    const previousMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const previousLimit = jest.fn().mockReturnValue({
      maybeSingle: previousMaybeSingle,
    });
    const previousOrder = jest.fn().mockReturnValue({ limit: previousLimit });
    const previousLt = jest.fn().mockReturnValue({ order: previousOrder });
    const previousEqForm = jest.fn().mockReturnValue({ lt: previousLt });
    const previousSelect = jest.fn().mockReturnValue({ eq: previousEqForm });

    const from = jest
      .fn()
      .mockReturnValueOnce({ select: formSelect })
      .mockReturnValueOnce({ select: currentSelect })
      .mockReturnValueOnce({ select: previousSelect });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.findPreviousQuestion(currentQuestion.id, form.slug),
    ).resolves.toBeNull();
  });

  it('returns the next question for a given question id', async () => {
    const formMaybeSingle = jest.fn().mockResolvedValue({ data: form, error: null });
    const formEq = jest.fn().mockReturnValue({ maybeSingle: formMaybeSingle });
    const formSelect = jest.fn().mockReturnValue({ eq: formEq });

    const currentMaybeSingle = jest
      .fn()
      .mockResolvedValue({ data: currentQuestion, error: null });
    const currentEqId = jest.fn().mockReturnValue({ maybeSingle: currentMaybeSingle });
    const currentEqForm = jest.fn().mockReturnValue({ eq: currentEqId });
    const currentSelect = jest.fn().mockReturnValue({ eq: currentEqForm });

    const nextMaybeSingle = jest.fn().mockResolvedValue({ data: nextQuestion, error: null });
    const nextLimit = jest.fn().mockReturnValue({ maybeSingle: nextMaybeSingle });
    const nextOrder = jest.fn().mockReturnValue({ limit: nextLimit });
    const nextGt = jest.fn().mockReturnValue({ order: nextOrder });
    const nextEqForm = jest.fn().mockReturnValue({ gt: nextGt });
    const nextSelect = jest.fn().mockReturnValue({ eq: nextEqForm });

    const from = jest
      .fn()
      .mockReturnValueOnce({ select: formSelect })
      .mockReturnValueOnce({ select: currentSelect })
      .mockReturnValueOnce({ select: nextSelect });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(service.findNextQuestion(currentQuestion.id, form.slug)).resolves.toMatchObject({
      questionId: nextQuestion.id,
      fieldKey: nextQuestion.field_key,
      position: nextQuestion.position,
    });
  });

  it('throws when the current question does not exist', async () => {
    const formMaybeSingle = jest.fn().mockResolvedValue({ data: form, error: null });
    const formEq = jest.fn().mockReturnValue({ maybeSingle: formMaybeSingle });
    const formSelect = jest.fn().mockReturnValue({ eq: formEq });

    const currentMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
    const currentEqId = jest.fn().mockReturnValue({ maybeSingle: currentMaybeSingle });
    const currentEqForm = jest.fn().mockReturnValue({ eq: currentEqId });
    const currentSelect = jest.fn().mockReturnValue({ eq: currentEqForm });

    const from = jest
      .fn()
      .mockReturnValueOnce({ select: formSelect })
      .mockReturnValueOnce({ select: currentSelect });

    supabaseService.getClient.mockReturnValue({ from });

    await expect(
      service.findPreviousQuestion(currentQuestion.id, form.slug),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
