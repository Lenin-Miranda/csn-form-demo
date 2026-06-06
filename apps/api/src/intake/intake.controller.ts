import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateIntakeQuestionDto } from './dto/intake.dto';
import { IntakeService } from './intake.service';

@Controller('intake')
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Get()
  findDefaultQuestions() {
    return this.intakeService.findQuestions();
  }

  @Get(':formSlug/questions')
  findQuestions(@Param('formSlug') formSlug: string) {
    return this.intakeService.findQuestions(formSlug);
  }

  @Post('questions')
  createQuestion(@Body() dto: CreateIntakeQuestionDto) {
    return this.intakeService.createQuestion(dto);
  }
}
