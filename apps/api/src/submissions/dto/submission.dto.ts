import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';
import { trimAndLowercaseString, trimString } from '../../common/transformers';

export class CreateIntakeDto {
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
