import { Controller, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProcessEmailJobsDto } from './dto/process-email-jobs.dto';
import { EmailJobsProcessorService } from './email-jobs-processor.service';
@Controller('email-jobs')
export class EmailJobsController {
  constructor(
    private readonly emailJobsProcessorService: EmailJobsProcessorService,
  ) {}

  @Post('process')
  async processPending(@Body() dto: ProcessEmailJobsDto = {}) {
    const processed = await this.emailJobsProcessorService.processPending(
      dto.limit,
    );
    return { ok: true, processed: processed ?? 0 };
  }
  @Post(':id/process')
  async processById(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.emailJobsProcessorService.processById(id);
    return { ok: true };
  }
}
