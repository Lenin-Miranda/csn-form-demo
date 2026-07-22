import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { trimAndLowercaseString, trimString } from '../../common/transformers';

export class CreateSubmissionAnswerDto {
  @Transform(trimString)
  @IsUUID()
  questionId!: string;

  @Transform(({ value }) =>
    value === null || value === undefined ? '' : String(value).trim(),
  )
  @IsString()
  value!: string;
}

export class CreateIntakeDto {
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
  @MaxLength(100)
  name!: string;

  @Transform(trimAndLowercaseString)
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9()+\-\s]{7,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  program!: string;

  @IsOptional()
  @IsIn(['en', 'es'])
  locale?: 'en' | 'es';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSubmissionAnswerDto)
  answers!: CreateSubmissionAnswerDto[];
}

export class CreateSubmissionDto {
  @Transform(trimString)
  @IsUUID()
  studentId!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  program!: string;
}
