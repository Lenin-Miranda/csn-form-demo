import { Body, Controller, Post } from '@nestjs/common';
import { CreateIntakeDto } from './dto/submission.dto';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body() dto: CreateIntakeDto) {
    return this.submissionsService.create(dto);
  }
}
