import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  QueryCoursesDto,
} from './dto/course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  findAll(@Query() query: QueryCoursesDto, @User('userId') userId?: string) {
    return this.coursesService.findAll(query, userId);
  }

  @Get('my-enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my enrolled courses' })
  getMyEnrollments(@User('userId') userId: string) {
    return this.coursesService.getMyEnrollments(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string, @User('userId') userId?: string) {
    return this.coursesService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create course' })
  create(@Body() createCourseDto: CreateCourseDto, @User('role') role: string) {
    return this.coursesService.create(createCourseDto, role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @User('userId') userId: string,
    @User('role') role: string,
  ) {
    return this.coursesService.update(id, updateCourseDto, userId, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete course' })
  remove(
    @Param('id') id: string,
    @User('userId') userId: string,
    @User('role') role: string,
  ) {
    return this.coursesService.remove(id, userId, role);
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll in course' })
  enroll(@Param('id') id: string, @User('userId') userId: string) {
    return this.coursesService.enroll(id, userId);
  }

  @Delete(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unenroll from course' })
  unenroll(@Param('id') id: string, @User('userId') userId: string) {
    return this.coursesService.unenroll(id, userId);
  }

  @Get(':id/progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student progress in course' })
  getStudentProgress(
    @Param('id') courseId: string,
    @User('userId') userId: string,
  ) {
    return this.coursesService.getStudentProgress(userId, courseId);
  }

  @Get(':id/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course statistics (Instructor only)' })
  getCourseStatistics(
    @Param('id') courseId: string,
    @User('userId') userId: string,
  ) {
    return this.coursesService.getCourseStatistics(courseId, userId);
  }

  @Get(':id/certificate-eligibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check certificate eligibility' })
  checkCertificateEligibility(
    @Param('id') courseId: string,
    @User('userId') userId: string,
  ) {
    return this.coursesService.checkCertificateEligibility(userId, courseId);
  }

  @Get(':id/students')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrolled students for a course' })
  @ApiResponse({ status: 200, description: 'List of enrolled students' })
  getEnrolledStudents(@Param('id') courseId: string) {
    return this.coursesService.getEnrolledStudents(courseId);
  }

  @Get(':id/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get comprehensive course details with all related data (Instructor only)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Complete course details including modules, resources, assignments, announcements, quizzes, and enrollments',
  })
  getCourseDetails(
    @Param('id') courseId: string,
    @User('userId') userId: string,
  ) {
    return this.coursesService.getCourseDetails(courseId, userId);
  }

  @Post(':id/calculate-progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recalculate enrollment progress' })
  async calculateProgress(
    @Param('id') courseId: string,
    @User('userId') userId: string,
  ) {
    const progress = await this.coursesService.calculateEnrollmentProgress(
      userId,
      courseId,
    );
    return {
      success: true,
      data: { progress },
      message: 'Progress updated successfully',
    };
  }
}
