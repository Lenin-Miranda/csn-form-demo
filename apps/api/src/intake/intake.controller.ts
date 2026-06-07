import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

  @Get(':formSlug/questions/:questionId/previous')
  findPreviousQuestion(
    @Param('formSlug') formSlug: string,
    @Param('questionId', new ParseUUIDPipe()) questionId: string,
  ) {
    return this.intakeService.findPreviousQuestion(questionId, formSlug);
  }

  @Get(':formSlug/questions/:questionId/next')
  findNextQuestion(
    @Param('formSlug') formSlug: string,
    @Param('questionId', new ParseUUIDPipe()) questionId: string,
  ) {
    return this.intakeService.findNextQuestion(questionId, formSlug);
  }

  @Post('questions')
  createQuestion(@Body() dto: CreateIntakeQuestionDto) {
    return this.intakeService.createQuestion(dto);
  }
}
