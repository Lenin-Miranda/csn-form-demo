import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { trimString } from '../../common/transformers';

export const INTAKE_QUESTION_TYPES = [
  'text',
  'email',
  'tel',
  'textarea',
  'select',
  'number',
  'date',
] as const;

export type IntakeQuestionType = (typeof INTAKE_QUESTION_TYPES)[number];

export class CreateIntakeQuestionDto {
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'formSlug must be kebab-case',
  })
  formSlug?: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'fieldKey must be snake_case and start with a letter',
  })
  fieldKey!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
  label!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @IsIn(INTAKE_QUESTION_TYPES)
  type!: IntakeQuestionType;

  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  placeholder?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  options?: string[];
}

export { CreateIntakeQuestionDto as CreateIntakeDto };
