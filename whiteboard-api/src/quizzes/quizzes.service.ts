import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Inject,
    forwardRef,
    Optional,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
    CreateQuizDto,
    UpdateQuizDto,
    CreateQuizQuestionDto,
    UpdateQuizQuestionDto,
    SubmitQuizAnswerDto,
} from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private prisma: PrismaService,
    @Optional()
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService?: NotificationsService,
  ) {}

  async createQuiz(userId: string, dto: CreateQuizDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course || course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can create quizzes',
      );
    }

    const quiz = await this.prisma.quiz.create({
      data: {
        courseId: dto.courseId,
        moduleId: dto.moduleId,
        title: dto.title,
        description: dto.description,
        type: (dto.type as any) || 'PRACTICE',
        timeLimit: dto.timeLimit,
        passingScore: dto.passingScore || 70,
        maxAttempts: dto.maxAttempts,
        isPublished: dto.isPublished || false,
        availableFrom: dto.availableFrom,
        availableUntil: dto.availableUntil,
        showAnswers: dto.showAnswers || false,
        shuffleQuestions: dto.shuffleQuestions || false,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: quiz,
      message: 'Quiz created successfully',
    };
  }

  async getQuizById(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const isInstructor = quiz.course.instructorId === userId;
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: quiz.courseId,
        userId: userId,
      },
    });

    if (!isInstructor && !enrollment) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    if (!isInstructor && !quiz.showAnswers) {
      quiz.questions = quiz.questions.map((q) => ({
        ...q,
        correctAnswer: null,
        explanation: null,
      }));
    }

    return {
      success: true,
      data: quiz,
    };
  }

  async updateQuiz(userId: string, quizId: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can update quizzes',
      );
    }

    const updatedQuiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as any,
        timeLimit: dto.timeLimit,
        passingScore: dto.passingScore,
        maxAttempts: dto.maxAttempts,
        isPublished: dto.isPublished,
        availableFrom: dto.availableFrom,
        availableUntil: dto.availableUntil,
        showAnswers: dto.showAnswers,
        shuffleQuestions: dto.shuffleQuestions,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: updatedQuiz,
      message: 'Quiz updated successfully',
    };
  }

  async deleteQuiz(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can delete quizzes',
      );
    }

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });

    return {
      success: true,
      message: 'Quiz deleted successfully',
    };
  }

  async getQuizzesByCourse(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: courseId,
        userId: userId,
      },
    });

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    const isInstructor = course?.instructorId === userId;

    if (!isInstructor && !enrollment) {
      throw new ForbiddenException('You do not have access to this course');
    }

    const quizzes = await this.prisma.quiz.findMany({
      where: {
        courseId: courseId,
        ...(isInstructor ? {} : { isPublished: true }),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            type: true,
            points: true,
            order: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: quizzes,
    };
  }

  async getQuizzesByModule(userId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: module.courseId,
        userId: userId,
      },
    });

    const isInstructor = module.course.instructorId === userId;

    if (!isInstructor && !enrollment) {
      throw new ForbiddenException('You do not have access to this module');
    }

    const quizzes = await this.prisma.quiz.findMany({
      where: {
        moduleId: moduleId,
        ...(isInstructor ? {} : { isPublished: true }),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            type: true,
            points: true,
            order: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: quizzes,
    };
  }

  async createQuestion(userId: string, dto: CreateQuizQuestionDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: {
        course: true,
      },
    });

    if (!quiz || quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can create quiz questions',
      );
    }

    const existingQuestions = await this.prisma.quizQuestion.findMany({
      where: { quizId: dto.quizId },
      select: { order: true },
      orderBy: { order: 'desc' },
      take: 1,
    });

    const nextOrder =
      existingQuestions.length > 0 ? existingQuestions[0].order + 1 : 0;

    const question = await this.prisma.quizQuestion.create({
      data: {
        quizId: dto.quizId,
        question: dto.question,
        type: dto.type,
        options: (dto.options || []) as any,
        correctAnswer: dto.correctAnswer,
        points: dto.points || 1,
        order: nextOrder,
        explanation: dto.explanation,
      },
    });

    return {
      success: true,
      data: question,
      message: 'Question created successfully',
    };
  }

  async updateQuestion(
    userId: string,
    questionId: string,
    dto: UpdateQuizQuestionDto,
  ) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can update quiz questions',
      );
    }

    const updatedQuestion = await this.prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        question: dto.question,
        type: dto.type,
        options: dto.options as any,
        correctAnswer: dto.correctAnswer,
        points: dto.points,
        order: dto.order,
        explanation: dto.explanation,
      },
    });

    return {
      success: true,
      data: updatedQuestion,
      message: 'Question updated successfully',
    };
  }

  async deleteQuestion(userId: string, questionId: string) {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can delete quiz questions',
      );
    }

    await this.prisma.quizQuestion.delete({
      where: { id: questionId },
    });

    return {
      success: true,
      message: 'Question deleted successfully',
    };
  }

  async startQuizAttempt(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (!quiz.isPublished) {
      throw new BadRequestException('Quiz is not published yet');
    }

    const isInstructor = quiz.course.instructorId === userId;
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: quiz.courseId,
        userId: userId,
      },
    });

    if (!isInstructor && !enrollment) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    if (quiz.maxAttempts) {
      const previousAttempts = await this.prisma.quizSubmission.count({
        where: {
          quizId: quizId,
          userId: userId,
        },
      });

      if (previousAttempts >= quiz.maxAttempts) {
        throw new BadRequestException('Maximum number of attempts reached');
      }
    }

    const lastSubmission = await this.prisma.quizSubmission.findFirst({
      where: {
        quizId: quizId,
        userId: userId,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    const attemptNumber = lastSubmission ? lastSubmission.attemptNumber + 1 : 1;

    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId: quizId,
        userId: userId,
        attemptNumber: attemptNumber,
      },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!isInstructor && !quiz.showAnswers) {
      submission.quiz.questions = submission.quiz.questions.map((q) => ({
        ...q,
        correctAnswer: null,
        explanation: null,
      }));
    }

    return {
      success: true,
      data: submission,
      message: 'Quiz attempt started successfully',
    };
  }

  async submitAnswer(userId: string, dto: SubmitQuizAnswerDto) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: dto.submissionId },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new ForbiddenException('This is not your submission');
    }

    if (submission.submittedAt) {
      throw new BadRequestException('Quiz has already been submitted');
    }

    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: dto.questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    let isCorrect: boolean | null = null;
    let pointsEarned = 0;

    if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
      isCorrect = dto.answer.trim() === question.correctAnswer?.trim();
      pointsEarned = isCorrect ? question.points : 0;
    }

    // Check if answer already exists
    const existingAnswer = await this.prisma.quizAnswer.findFirst({
      where: {
        submissionId: dto.submissionId,
        questionId: dto.questionId,
      },
    });

    let answer;
    if (existingAnswer) {
      answer = await this.prisma.quizAnswer.update({
        where: { id: existingAnswer.id },
        data: {
          answer: dto.answer,
          isCorrect: isCorrect,
          pointsEarned: pointsEarned,
        },
      });
    } else {
      answer = await this.prisma.quizAnswer.create({
        data: {
          submissionId: dto.submissionId,
          questionId: dto.questionId,
          answer: dto.answer,
          isCorrect: isCorrect,
          pointsEarned: pointsEarned,
        },
      });
    }

    return {
      success: true,
      data: answer,
      message: 'Answer saved successfully',
    };
  }

  async submitQuiz(userId: string, submissionId: string) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: submissionId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.userId !== userId) {
      throw new ForbiddenException('This is not your submission');
    }

    if (submission.submittedAt) {
      throw new BadRequestException('Quiz has already been submitted');
    }

    const totalPoints = submission.quiz.questions.reduce(
      (sum, q) => sum + q.points,
      0,
    );
    const earnedPoints = submission.answers.reduce(
      (sum, a) => sum + a.pointsEarned,
      0,
    );
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = score >= submission.quiz.passingScore;

    const timeSpent = Math.floor(
      (new Date().getTime() - submission.startedAt.getTime()) / 1000,
    );

    const updatedSubmission = await this.prisma.quizSubmission.update({
      where: { id: submissionId },
      data: {
        submittedAt: new Date(),
        score: score,
        isPassed: isPassed,
        timeSpent: timeSpent,
      },
      include: {
        quiz: {
          include: {
            questions: true,
            course: {
              select: {
                title: true,
              },
            },
            module: {
              select: {
                title: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // Send notification about quiz completion
    if (this.notificationsService) {
      await this.notificationsService.notifyQuizCompleted(
        userId,
        updatedSubmission.quiz.title,
        updatedSubmission.quiz.course?.title ||
          updatedSubmission.quiz.module?.title ||
          'Course',
        earnedPoints,
        totalPoints,
        updatedSubmission.quizId,
      );
    }

    return {
      success: true,
      data: updatedSubmission,
      message: `Quiz submitted successfully. Score: ${score.toFixed(2)}%`,
    };
  }

  async getSubmission(userId: string, submissionId: string) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: submissionId },
      include: {
        quiz: {
          include: {
            course: true,
            questions: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const isInstructor = submission.quiz.course.instructorId === userId;
    const isStudent = submission.userId === userId;

    if (!isInstructor && !isStudent) {
      throw new ForbiddenException('You do not have access to this submission');
    }

    return {
      success: true,
      data: submission,
    };
  }

  async getMyAttempts(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: quiz.courseId,
        userId: userId,
      },
    });

    if (!enrollment && quiz.course.instructorId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz');
    }

    const attempts = await this.prisma.quizSubmission.findMany({
      where: {
        quizId: quizId,
        userId: userId,
      },
      orderBy: { attemptNumber: 'desc' },
    });

    return {
      success: true,
      data: attempts,
    };
  }

  async getQuizSubmissions(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can view all submissions',
      );
    }

    const submissions = await this.prisma.quizSubmission.findMany({
      where: {
        quizId: quizId,
        submittedAt: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const studentSubmissions = submissions.reduce(
      (acc, submission) => {
        const studentId = submission.userId;
        if (!acc[studentId]) {
          acc[studentId] = {
            studentId: studentId,
            userName: `${submission.user.firstName} ${submission.user.lastName}`,
            email: submission.user.email,
            attempts: [],
          };
        }
        acc[studentId].attempts.push(submission);
        return acc;
      },
      {} as Record<string, any>,
    );

    return {
      success: true,
      data: Object.values(studentSubmissions),
    };
  }

  async gradeSubmission(
    userId: string,
    submissionId: string,
    answerId: string,
    pointsEarned: number,
    feedback?: string,
  ) {
    const submission = await this.prisma.quizSubmission.findUnique({
      where: { id: submissionId },
      include: {
        quiz: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.quiz.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can grade submissions',
      );
    }

    const answer = await this.prisma.quizAnswer.update({
      where: { id: answerId },
      data: {
        pointsEarned: pointsEarned,
        feedback: feedback,
      },
    });

    const answers = await this.prisma.quizAnswer.findMany({
      where: { submissionId: submissionId },
    });

    const questions = await this.prisma.quizQuestion.findMany({
      where: { quizId: submission.quizId },
    });

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = score >= submission.quiz.passingScore;

    await this.prisma.quizSubmission.update({
      where: { id: submissionId },
      data: {
        score: score,
        isPassed: isPassed,
      },
    });

    return {
      success: true,
      data: answer,
      message: 'Answer graded successfully',
    };
  }
}
