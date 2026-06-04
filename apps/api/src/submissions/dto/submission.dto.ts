import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateSubmissionDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Transform(({ value }) => value?.trim())
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
