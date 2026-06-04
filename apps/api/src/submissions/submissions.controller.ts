import { Body, Controller, Post } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';
import { dot } from 'node:test/reporters';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }
}
