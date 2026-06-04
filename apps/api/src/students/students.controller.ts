import { Controller, Post, Body } from '@nestjs/common';
import { CreateStudentDto } from './dto/students.dto';
import { StudentsService } from './students.service';
@Controller('students')
export class StudentsController {
  constructor(private readonly studentService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }
}
