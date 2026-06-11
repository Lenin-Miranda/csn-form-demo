import { IsNumber, Max, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
export class ProcessEmailJobsDto {
  @IsNumber()
  @Max(1000)
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
