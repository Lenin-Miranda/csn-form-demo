import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
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
