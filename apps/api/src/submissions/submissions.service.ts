import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  CreateIntakeDto,
  CreateSubmissionAnswerDto,
} from './dto/submission.dto';
import { SupabaseService } from '../supabase/supabase.service';

const DEFAULT_INTAKE_FORM_SLUG = 'student-intake';

export interface SubmissionRow {
  id: string;
  student_id: string;
  program: string;
  created_at: string;
}

interface IntakeFormRow {
  id: string;
  slug: string;
}

interface IntakeQuestionRow {
  id: string;
  field_key: string;
  type: string;
  is_required: boolean;
}

type NormalizedSubmissionAnswer = {
  questionId: string;
  fieldKey: string;
  questionType: string;
  answer: boolean | number | string;
};

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(dto: CreateIntakeDto): Promise<SubmissionRow> {
    const supabase = this.supabaseService.getClient();
    const form = await this.findFormBySlug(
      dto.formSlug ?? DEFAULT_INTAKE_FORM_SLUG,
    );
    const questions = await this.findQuestionsByFormId(form.id);
    const normalizedAnswers = this.normalizeAnswers(dto.answers, questions);

    const { data, error } = await supabase
      .rpc('create_intake_submission', {
        p_form_slug: form.slug,
        p_name: dto.name,
        p_email: dto.email,
        p_phone: dto.phone,
        p_program: dto.program,
        p_answers: normalizedAnswers,
        p_locale: dto.locale ?? 'en',
      })
      .single();

    if (error) {
      this.logger.error('Failed to create intake submission', error.message);
      throw new InternalServerErrorException('Could not create submission');
    }

    if (!data) {
      this.logger.error('Supabase returned no submission after RPC');
      throw new InternalServerErrorException('Could not create submission');
    }

    const submission = data as SubmissionRow;

    this.logger.log(
      `Submission created with id: ${submission.id} for form: ${form.slug}`,
    );
    return submission;
  }

  private async findFormBySlug(slug: string): Promise<IntakeFormRow> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('intake_forms')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Failed to look up intake form: ${slug}`,
        error.message,
      );
      throw new InternalServerErrorException('Could not look up intake form');
    }

    if (!data) {
      throw new BadRequestException('Intake form not found');
    }

    return data as IntakeFormRow;
  }

  private async findQuestionsByFormId(
    formId: string,
  ): Promise<IntakeQuestionRow[]> {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('intake_questions')
      .select('id, field_key, type, is_required')
      .eq('form_id', formId)
      .order('position', { ascending: true });

    if (error) {
      this.logger.error('Failed to load intake questions', error.message);
      throw new InternalServerErrorException('Could not load intake questions');
    }

    return (data ?? []) as IntakeQuestionRow[];
  }

  private normalizeAnswers(
    answers: CreateSubmissionAnswerDto[],
    questions: IntakeQuestionRow[],
  ): NormalizedSubmissionAnswer[] {
    const questionIds = new Set(questions.map((question) => question.id));
    const unknownAnswer = answers.find(
      (answer) => !questionIds.has(answer.questionId),
    );

    if (unknownAnswer) {
      throw new BadRequestException(
        `Question does not belong to the selected form: ${unknownAnswer.questionId}`,
      );
    }

    const submittedAnswers = new Map(
      answers.map((answer) => [answer.questionId, answer.value]),
    );

    return questions
      .map((question) => {
        const rawValue = submittedAnswers.get(question.id) ?? '';

        if (
          question.is_required &&
          !this.hasAnswerValue(question.type, rawValue)
        ) {
          throw new BadRequestException(
            `Missing answer for field: ${question.field_key}`,
          );
        }

        if (!this.hasAnswerValue(question.type, rawValue)) {
          return null;
        }

        return {
          questionId: question.id,
          fieldKey: question.field_key,
          questionType: question.type,
          answer: this.parseAnswerValue(question.type, rawValue),
        };
      })
      .filter(
        (answer): answer is NormalizedSubmissionAnswer => answer !== null,
      );
  }

  private hasAnswerValue(type: string, value: string) {
    if (type === 'boolean') {
      return value === 'true' || value === 'false';
    }

    return value.trim().length > 0;
  }

  private parseAnswerValue(type: string, value: string) {
    switch (type) {
      case 'boolean':
        return value === 'true';
      case 'number': {
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
          throw new BadRequestException(`Invalid numeric answer: ${value}`);
        }

        return parsed;
      }
      default:
        return value;
    }
  }
}
