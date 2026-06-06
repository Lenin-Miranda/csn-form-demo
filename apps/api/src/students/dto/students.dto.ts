import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { trimAndLowercaseString, trimString } from '../../common/transformers';

export class CreateStudentDto {
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
}

export { CreateStudentDto as CreateStudentsDto };
