import {
    IsString,
    IsOptional,
    IsInt,
    Min,
    IsDateString,
    IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'Week 1 - Introduction to Programming' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Complete exercises on variables and data types' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'Refer to chapter 2 in the textbook' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  maxPoints: number;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({ example: { files: ['file1.pdf', 'file2.doc'] } })
  @IsOptional()
  attachments?: any;
}

export class UpdateAssignmentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  maxPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  attachments?: any;
}

export class SubmitAssignmentDto {
  @ApiProperty({
    example:
      '# My Solution\n\nThis is my solution written in **markdown**.\n\n## Code\n\n```python\nprint("Hello World")\n```',
    description: 'Assignment content in markdown format',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: { files: ['submission.pdf'] } })
  @IsOptional()
  attachments?: any;
}

export class GradeSubmissionDto {
  @ApiProperty({ example: 95 })
  @IsInt()
  @Min(0)
  grade: number;

  @ApiPropertyOptional({
    example: 'Excellent work! Great attention to detail.',
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class QueryAssignmentsDto {
  @ApiPropertyOptional({ example: 'uuid-of-course' })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
