import {
    Injectable,
    NotFoundException,
    ForbiddenException, Inject,
    forwardRef
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    CreateAssignmentDto,
    UpdateAssignmentDto,
    SubmitAssignmentDto,
    GradeSubmissionDto,
    QueryAssignmentsDto,
} from './dto/assignment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateAssignmentDto) {
    // Check if user is the instructor of the course
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course || course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can create assignments',
      );
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.description,
        instructions: dto.instructions,
        dueDate: new Date(dto.dueDate),
        maxPoints: dto.maxPoints,
        attachments: dto.attachments || {},
        courseId: dto.courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    // Notify all enrolled students about new assignment
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: dto.courseId },
      select: { userId: true },
    });

    const studentIds = enrollments.map((e) => e.userId);
    if (studentIds.length > 0) {
      await this.notificationsService.notifyAssignmentCreated(
        studentIds,
        course.title,
        assignment.title,
        assignment.id,
        assignment.dueDate,
      );
    }

    return {
      success: true,
      data: assignment,
      message: 'Assignment created successfully',
    };
  }

  async findAll(userId: string, query: QueryAssignmentsDto) {
    const { courseId, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (courseId) {
      // Check if user is enrolled as student OR is the course instructor
      const enrollment = await this.prisma.enrollment.findFirst({
        where: {
          courseId,
          userId,
        },
      });

      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { instructorId: true },
      });

      const isInstructor = course?.instructorId === userId;

      if (!enrollment && !isInstructor) {
        throw new ForbiddenException('Not enrolled in this course');
      }

      where.courseId = courseId;
    } else {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true },
      });

      const courseIds = enrollments.map((e) => e.courseId);
      where.courseId = { in: courseIds };
    }

    const [assignments, total] = await Promise.all([
      this.prisma.assignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          course: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          submissions: {
            where: { userId },
            select: {
              id: true,
              submittedAt: true,
              grade: true,
            },
          },
        },
      }),
      this.prisma.assignment.count({ where }),
    ]);

    return {
      success: true,
      data: {
        assignments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Assignments retrieved successfully',
    };
  }

  async findOne(userId: string, id: string) {
    // First get the assignment to check if user is instructor
    const assignmentBasic = await this.prisma.assignment.findUnique({
      where: { id },
      select: {
        courseId: true,
      },
    });

    if (!assignmentBasic) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user is the course instructor
    const course = await this.prisma.course.findUnique({
      where: { id: assignmentBasic.courseId },
      select: { instructorId: true },
    });

    const isInstructor = course?.instructorId === userId;

    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            instructorId: true,
          },
        },
        submissions: isInstructor
          ? {
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
            }
          : {
              where: { userId },
            },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user is enrolled as student OR is the course instructor
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: assignment.courseId,
        userId,
      },
    });

    if (!enrollment && !isInstructor) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    return {
      success: true,
      data: assignment,
      message: 'Assignment retrieved successfully',
    };
  }

  async update(userId: string, id: string, dto: UpdateAssignmentDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user is the course instructor
    if (assignment.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can update assignments',
      );
    }

    const updatedAssignment = await this.prisma.assignment.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedAssignment,
      message: 'Assignment updated successfully',
    };
  }

  async remove(userId: string, id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user is the course instructor
    if (assignment.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can delete assignments',
      );
    }

    await this.prisma.assignment.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Assignment deleted successfully',
    };
  }

  async submit(userId: string, assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user is enrolled in the course
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        courseId: assignment.courseId,
        userId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    const existingSubmission = await this.prisma.submission.findFirst({
      where: {
        assignmentId,
        userId,
      },
    });

    let submission;

    if (existingSubmission) {
      // Allow resubmission - update existing submission
      submission = await this.prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          content: dto.content,
          attachments: dto.attachments || {},
          submittedAt: new Date(),
          // Reset grade and feedback when resubmitting
          grade: null,
          feedback: null,
          gradedAt: null,
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              maxPoints: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } else {
      // Create new submission
      submission = await this.prisma.submission.create({
        data: {
          content: dto.content,
          attachments: dto.attachments || {},
          submittedAt: new Date(),
          assignmentId,
          userId,
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              dueDate: true,
              maxPoints: true,
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    // Notify instructor about new submission
    const course = await this.prisma.course.findUnique({
      where: { id: assignment.courseId },
      select: { instructorId: true, title: true },
    });

    if (course) {
      const studentName = `${submission.user.firstName} ${submission.user.lastName}`;
      await this.notificationsService.notifySubmissionReceived(
        course.instructorId,
        studentName,
        assignment.title,
        submission.id,
        course.title,
      );
    }

    return {
      success: true,
      data: submission,
      message: 'Assignment submitted successfully',
    };
  }

  async gradeSubmission(
    userId: string,
    submissionId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Check if user is the course instructor
    if (submission.assignment.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can grade submissions',
      );
    }

    if (dto.grade > submission.assignment.maxPoints) {
      throw new ForbiddenException(
        `Grade cannot exceed ${submission.assignment.maxPoints} points`,
      );
    }

    const gradedSubmission = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: dto.grade,
        feedback: dto.feedback,
        gradedAt: new Date(),
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Notify student about graded submission
    await this.notificationsService.notifySubmissionGraded(
      submission.userId,
      submission.assignment.title,
      dto.grade,
      submission.id,
      submission.assignment.maxPoints,
      dto.feedback,
    );

    return {
      success: true,
      data: gradedSubmission,
      message: 'Submission graded successfully',
    };
  }

  async getSubmissions(userId: string, assignmentId: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if user is the course instructor
    if (assignment.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can view all submissions',
      );
    }

    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId },
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

    return {
      success: true,
      data: submissions,
      message: 'Submissions retrieved successfully',
    };
  }
}
