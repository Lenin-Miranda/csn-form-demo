import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CreateIntakeQuestionDto } from './dto/intake.dto';
import { SupabaseService } from '../supabase/supabase.service';

const DEFAULT_INTAKE_FORM_SLUG = 'student-intake';

interface IntakeFormRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_active: boolean;
}

interface IntakeQuestionRow {
  id: string;
  field_key: string;
  label: string;
  type: string;
  placeholder: string | null;
  is_required: boolean;
  position: number;
  options: string[] | null;
  created_at: string;
}

export interface IntakeQuestionResponse {
  questionId: string;
  fieldKey: string;
  label: string;
  type: string;
  placeholder: string | null;
  isRequired: boolean;
  position: number;
  options: string[] | null;
  createdAt: string;
}

export interface IntakeFormResponse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isActive: boolean;
  questions: IntakeQuestionResponse[];
}

@Injectable()
export class IntakeService {
  private readonly logger = new Logger(IntakeService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findQuestions(
    formSlug = DEFAULT_INTAKE_FORM_SLUG,
  ): Promise<IntakeFormResponse> {
    const supabase = this.supabaseService.getClient();
    const form = await this.findFormBySlug(supabase, formSlug);

    const result = await supabase
      .from('intake_questions')
      .select(
        'id, field_key, label, type, placeholder, is_required, position, options, created_at',
      )
      .eq('form_id', form.id)
      .order('position', { ascending: true });
    const data = (result.data ?? []) as IntakeQuestionRow[];
    const error = result.error;

    if (error) {
      this.logger.error('Failed to load intake questions', error.message);
      throw new InternalServerErrorException('Could not load intake questions');
    }

    return {
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description,
      isActive: form.is_active,
      questions: data.map((question) => this.mapQuestion(question)),
    };
  }

  async createQuestion(
    dto: CreateIntakeQuestionDto,
  ): Promise<IntakeQuestionResponse> {
    const supabase = this.supabaseService.getClient();
    const form = await this.findFormBySlug(
      supabase,
      dto.formSlug ?? DEFAULT_INTAKE_FORM_SLUG,
    );
    const position =
      dto.position ?? (await this.getNextQuestionPosition(supabase, form.id));

    const result = await supabase
      .from('intake_questions')
      .insert({
        form_id: form.id,
        field_key: dto.fieldKey,
        label: dto.label,
        type: dto.type,
        placeholder: dto.placeholder ?? null,
        is_required: dto.isRequired ?? true,
        position,
        options: dto.options ?? null,
      })
      .select(
        'id, field_key, label, type, placeholder, is_required, position, options, created_at',
      )
      .single();
    const data = result.data;
    const error = result.error;

    if (error) {
      if (error.code === '23505') {
        this.logger.warn(
          `Question already exists for form ${form.slug}: ${dto.fieldKey}`,
        );
        throw new ConflictException('Question already exists for this form');
      }

      this.logger.error('Failed to create question', error.message);
      throw new InternalServerErrorException('Could not create question');
    }

    if (!data) {
      this.logger.error('Supabase returned no question after insert');
      throw new InternalServerErrorException('Could not create question');
    }

    const question = this.mapQuestion(data);

    this.logger.log(`Question created with id: ${question.questionId}`);
    return question;
  }

  private async findFormBySlug(
    supabase: SupabaseClient,
    slug: string,
  ): Promise<IntakeFormRow> {
    const result = await supabase
      .from('intake_forms')
      .select('id, slug, title, description, is_active')
      .eq('slug', slug)
      .maybeSingle();
    const data = result.data;
    const error = result.error;

    if (error) {
      this.logger.error(
        `Failed to look up intake form: ${slug}`,
        error.message,
      );
      throw new InternalServerErrorException('Could not look up intake form');
    }

    if (!data) {
      throw new NotFoundException('Intake form not found');
    }

    return data;
  }

  private async getNextQuestionPosition(
    supabase: SupabaseClient,
    formId: string,
  ): Promise<number> {
    const result = await supabase
      .from('intake_questions')
      .select('position')
      .eq('form_id', formId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const data = result.data as unknown as { position?: unknown } | null;
    const error = result.error;

    if (error) {
      this.logger.error('Failed to calculate question position', error.message);
      throw new InternalServerErrorException(
        'Could not calculate question position',
      );
    }

    const currentPosition =
      typeof data?.position === 'number' ? data.position : 0;

    return currentPosition + 1;
  }

  private mapQuestion(question: IntakeQuestionRow): IntakeQuestionResponse {
    return {
      questionId: question.id,
      fieldKey: question.field_key,
      label: question.label,
      type: question.type,
      placeholder: question.placeholder,
      isRequired: question.is_required,
      position: question.position,
      options: question.options,
      createdAt: question.created_at,
    };
  }
}
