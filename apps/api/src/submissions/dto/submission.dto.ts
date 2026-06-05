import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateIntakeDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9()+\-\s]{7,20}$/, {
    message: 'phone must be a valid phone number',
  })
  phone!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  program!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  availability!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  location!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  csnBefore!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  gedHiset!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  heardAbout!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  transportation!: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  level?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  improve?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  studiedBefore?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  passedSubjects?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  supportSubject?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  area?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  priorExperience?: string;

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString()
  workAuthorization?: string;
}

export class CreateSubmissionDto {
  @Transform(({ value }) => value?.trim())
  @IsUUID()
  studentId!: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  program!: string;
}
