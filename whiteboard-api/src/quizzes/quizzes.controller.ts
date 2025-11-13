import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    CreateQuizDto,
    UpdateQuizDto,
    CreateQuizQuestionDto,
    UpdateQuizQuestionDto,
    SubmitQuizAnswerDto,
} from './dto/quiz.dto';

@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // Quiz Management
  @Post()
  createQuiz(@Request() req, @Body() dto: CreateQuizDto) {
    return this.quizzesService.createQuiz(req.user.userId, dto);
  }

  @Get(':id')
  getQuiz(@Request() req, @Param('id') id: string) {
    return this.quizzesService.getQuizById(req.user.userId, id);
  }

  @Put(':id')
  updateQuiz(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzesService.updateQuiz(req.user.userId, id, dto);
  }

  @Delete(':id')
  deleteQuiz(@Request() req, @Param('id') id: string) {
    return this.quizzesService.deleteQuiz(req.user.userId, id);
  }

  @Get('course/:courseId')
  getQuizzesByCourse(@Request() req, @Param('courseId') courseId: string) {
    return this.quizzesService.getQuizzesByCourse(req.user.userId, courseId);
  }

  @Get('module/:moduleId')
  getQuizzesByModule(@Request() req, @Param('moduleId') moduleId: string) {
    return this.quizzesService.getQuizzesByModule(req.user.userId, moduleId);
  }

  // Question Management
  @Post('questions')
  createQuestion(@Request() req, @Body() dto: CreateQuizQuestionDto) {
    return this.quizzesService.createQuestion(req.user.userId, dto);
  }

  @Put('questions/:id')
  updateQuestion(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.quizzesService.updateQuestion(req.user.userId, id, dto);
  }

  @Delete('questions/:id')
  deleteQuestion(@Request() req, @Param('id') id: string) {
    return this.quizzesService.deleteQuestion(req.user.userId, id);
  }

  // Quiz Taking
  @Post(':id/attempt')
  startQuizAttempt(@Request() req, @Param('id') id: string) {
    return this.quizzesService.startQuizAttempt(req.user.userId, id);
  }

  @Post('submissions/answer')
  submitAnswer(@Request() req, @Body() dto: SubmitQuizAnswerDto) {
    return this.quizzesService.submitAnswer(req.user.userId, dto);
  }

  @Post('submissions/:id/submit')
  submitQuiz(@Request() req, @Param('id') id: string) {
    return this.quizzesService.submitQuiz(req.user.userId, id);
  }

  @Get('submissions/:id')
  getSubmission(@Request() req, @Param('id') id: string) {
    return this.quizzesService.getSubmission(req.user.userId, id);
  }

  @Get(':id/my-attempts')
  getMyAttempts(@Request() req, @Param('id') id: string) {
    return this.quizzesService.getMyAttempts(req.user.userId, id);
  }

  // Instructor Grading
  @Get(':id/submissions')
  getQuizSubmissions(@Request() req, @Param('id') id: string) {
    return this.quizzesService.getQuizSubmissions(req.user.userId, id);
  }

  @Post('submissions/:submissionId/grade')
  gradeSubmission(
    @Request() req,
    @Param('submissionId') submissionId: string,
    @Body() body: { answerId: string; pointsEarned: number; feedback?: string },
  ) {
    return this.quizzesService.gradeSubmission(
      req.user.userId,
      submissionId,
      body.answerId,
      body.pointsEarned,
      body.feedback,
    );
  }
}
