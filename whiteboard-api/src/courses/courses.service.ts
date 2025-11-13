import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  QueryCoursesDto,
} from './dto/course.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryCoursesDto, userId?: string) {
    const { page = 1, limit = 10, search, instructorId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: { enrollments: true },
          },
          ...(userId && {
            enrollments: {
              where: { userId },
              select: { id: true },
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    const coursesWithEnrollment = courses.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
      isEnrolled: userId ? course.enrollments.length > 0 : false,
      enrollments: undefined,
      _count: undefined,
    }));

    return {
      success: true,
      data: {
        courses: coursesWithEnrollment,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
        ...(userId && {
          enrollments: {
            where: { userId },
            select: { id: true, progress: true, grade: true },
          },
        }),
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      success: true,
      data: {
        ...course,
        enrollmentCount: course._count.enrollments,
        isEnrolled: userId ? course.enrollments.length > 0 : false,
        myEnrollment:
          userId && course.enrollments.length > 0
            ? course.enrollments[0]
            : null,
        enrollments: undefined,
        _count: undefined,
      },
    };
  }

  /**
   * Get comprehensive course details with all related data
   * For instructor management interface
   */
  async getCourseDetails(courseId: string, userId: string) {
    // Check if course exists and user is the instructor
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        instructorId: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can view detailed course information',
      );
    }

    // Fetch all course data in parallel
    const [
      courseData,
      modules,
      assignments,
      announcements,
      quizzes,
      enrollments,
    ] = await Promise.all([
      // Basic course data with instructor
      this.prisma.course.findUnique({
        where: { id: courseId },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              assignments: true,
              modules: true,
              announcements: true,
              quizzes: true,
            },
          },
        },
      }),

      // Modules with resources and progress
      this.prisma.courseModule.findMany({
        where: { courseId },
        include: {
          resources: {
            include: {
              _count: {
                select: { progress: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              resources: true,
              progress: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      }),

      // Assignments with submission counts
      this.prisma.assignment.findMany({
        where: { courseId },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),

      // Announcements
      this.prisma.announcement.findMany({
        where: { courseId },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),

      // Quizzes with question counts
      this.prisma.quiz.findMany({
        where: { courseId },
        include: {
          module: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              questions: true,
              submissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Enrollments with user details and progress
      this.prisma.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
    ]);

    return {
      success: true,
      data: {
        course: courseData,
        modules: modules.map((module) => ({
          ...module,
          resourceCount: module._count.resources,
          completedCount: module._count.progress,
          resources: module.resources.map((resource) => ({
            ...resource,
            completedCount: resource._count.progress,
          })),
        })),
        assignments: assignments.map((assignment) => ({
          ...assignment,
          submissionCount: assignment._count.submissions,
        })),
        announcements,
        quizzes: quizzes.map((quiz) => ({
          ...quiz,
          questionCount: quiz._count.questions,
          submissionCount: quiz._count.submissions,
        })),
        enrollments: enrollments.map((enrollment) => ({
          ...enrollment,
          studentName: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
        })),
        stats: {
          totalModules: modules.length,
          totalResources: modules.reduce(
            (sum, m) => sum + m._count.resources,
            0,
          ),
          totalAssignments: assignments.length,
          totalAnnouncements: announcements.length,
          totalQuizzes: quizzes.length,
          totalEnrollments: enrollments.length,
          averageProgress:
            enrollments.length > 0
              ? Math.round(
                  enrollments.reduce((sum, e) => sum + e.progress, 0) /
                    enrollments.length,
                )
              : 0,
        },
      },
      message: 'Course details retrieved successfully',
    };
  }

  async create(createCourseDto: CreateCourseDto, requestUserRole: string) {
    if (requestUserRole !== 'INSTRUCTOR' && requestUserRole !== 'ADMIN') {
      throw new ForbiddenException(
        'Only instructors and admins can create courses',
      );
    }

    // Check if course code already exists
    const existingCourse = await this.prisma.course.findUnique({
      where: { code: createCourseDto.code },
    });

    if (existingCourse) {
      throw new ConflictException('Course code already exists');
    }

    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        startDate: new Date(createCourseDto.startDate),
        endDate: new Date(createCourseDto.endDate),
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: course,
      message: 'Course created successfully',
    };
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    requestUserId: string,
    requestUserRole: string,
  ) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check authorization
    if (requestUserRole !== 'ADMIN' && course.instructorId !== requestUserId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: {
        ...updateCourseDto,
        ...(updateCourseDto.startDate && {
          startDate: new Date(updateCourseDto.startDate),
        }),
        ...(updateCourseDto.endDate && {
          endDate: new Date(updateCourseDto.endDate),
        }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully',
    };
  }

  async remove(id: string, requestUserId: string, requestUserRole: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Only admin or course instructor can delete
    if (requestUserRole !== 'ADMIN' && course.instructorId !== requestUserId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    await this.prisma.course.delete({ where: { id } });

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  async enroll(courseId: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Check if course is full
    if (course._count.enrollments >= course.maxEnrollment) {
      throw new ConflictException('Course is full');
    }

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            title: true,
            instructorId: true,
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

    // Notify student about enrollment
    await this.notificationsService.notifyCourseEnrollment(
      userId,
      course.title,
      courseId,
    );

    // Notify instructor about new enrollment
    await this.notificationsService.create({
      userId: enrollment.course.instructorId,
      type: 'ENROLLMENT',
      title: 'New Student Enrolled',
      message: `${enrollment.user.firstName} ${enrollment.user.lastName} enrolled in ${course.title}`,
      data: { courseId, studentId: userId },
    });

    return {
      success: true,
      data: enrollment,
      message: 'Enrolled successfully',
    };
  }

  async unenroll(courseId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    return {
      success: true,
      message: 'Unenrolled successfully',
    };
  }

  async getMyEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return {
      success: true,
      data: enrollments,
    };
  }

  /**
   * Calculate and update enrollment progress based on completed modules and resources
   */
  async calculateEnrollmentProgress(userId: string, courseId: string) {
    // Get all modules for the course
    const modules = await this.prisma.courseModule.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      include: {
        resources: {
          where: { isRequired: true },
        },
      },
    });

    if (modules.length === 0) {
      return 0;
    }

    // Count total required resources across all modules
    const totalResources = modules.reduce(
      (sum, module) => sum + module.resources.length,
      0,
    );

    if (totalResources === 0) {
      return 0;
    }

    // Get completed resources for this user
    const completedResources = await this.prisma.resourceProgress.count({
      where: {
        userId,
        isCompleted: true,
        resource: {
          moduleId: { in: modules.map((m) => m.id) },
          isRequired: true,
        },
      },
    });

    // Calculate progress percentage
    const progress = Math.round((completedResources / totalResources) * 100);

    // Update enrollment progress
    await this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: { progress },
    });

    return progress;
  }

  /**
   * Get student progress for a specific course
   */
  async getStudentProgress(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Not enrolled in this course');
    }

    const [modules, assignments, certificates] = await Promise.all([
      // Module progress
      this.prisma.courseModule.findMany({
        where: {
          courseId,
          isPublished: true,
        },
        include: {
          resources: {
            include: {
              progress: {
                where: { userId },
              },
            },
          },
          progress: {
            where: { userId },
          },
        },
        orderBy: { order: 'asc' },
      }),

      // Assignment progress
      this.prisma.assignment.findMany({
        where: { courseId },
        include: {
          submissions: {
            where: { userId },
          },
        },
        orderBy: { dueDate: 'asc' },
      }),

      // Check for certificate
      this.prisma.certificate.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        enrollment,
        modules: modules.map((module) => ({
          ...module,
          completedResources: module.resources.filter(
            (r) => r.progress[0]?.isCompleted,
          ).length,
          totalResources: module.resources.length,
          isCompleted: module.progress[0]?.isCompleted || false,
        })),
        assignments: assignments.map((assignment) => ({
          ...assignment,
          submitted: assignment.submissions.length > 0,
          submission: assignment.submissions[0] || null,
        })),
        certificate: certificates,
        overallProgress: enrollment.progress,
      },
    };
  }

  /**
   * Check if student is eligible for certificate
   */
  async checkCertificateEligibility(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return {
        success: false,
        data: {
          isEligible: false,
          reason: 'Not enrolled in course',
        },
      };
    }

    // Check if already has certificate
    const existingCertificate = await this.prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingCertificate) {
      return {
        success: true,
        data: {
          isEligible: true,
          hasCertificate: true,
          certificate: existingCertificate,
        },
      };
    }

    // Check completion requirements
    const requirements = {
      minimumProgress: 100,
      allAssignmentsSubmitted: true,
    };

    const assignmentsCount = await this.prisma.assignment.count({
      where: { courseId },
    });

    const submissionsCount = await this.prisma.submission.count({
      where: {
        userId,
        assignment: { courseId },
      },
    });

    const isEligible =
      enrollment.progress >= requirements.minimumProgress &&
      (assignmentsCount === 0 || submissionsCount >= assignmentsCount);

    return {
      success: true,
      data: {
        isEligible,
        hasCertificate: false,
        requirements: {
          progress: {
            current: enrollment.progress,
            required: requirements.minimumProgress,
            met: enrollment.progress >= requirements.minimumProgress,
          },
          assignments: {
            total: assignmentsCount,
            submitted: submissionsCount,
            met: assignmentsCount === 0 || submissionsCount >= assignmentsCount,
          },
        },
      },
    };
  }

  async getEnrolledStudents(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    const students = enrollments.map((enrollment) => ({
      id: enrollment.user.id,
      firstName: enrollment.user.firstName,
      lastName: enrollment.user.lastName,
      name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
      email: enrollment.user.email,
      image: enrollment.user.avatar,
      role: enrollment.user.role,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      updatedAt: enrollment.updatedAt,
    }));

    return {
      success: true,
      data: {
        students,
        total: students.length,
      },
      message: 'Enrolled students retrieved successfully',
    };
  }

  async getCourseStatistics(courseId: string, userId: string) {
    // Check if course exists and user is the instructor
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        instructorId: true,
        title: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can view statistics',
      );
    }

    // Get statistics in parallel
    const [
      assignmentsCount,
      modulesCount,
      resourcesCount,
      enrolledStudentsCount,
    ] = await Promise.all([
      this.prisma.assignment.count({
        where: { courseId },
      }),
      this.prisma.courseModule.count({
        where: { courseId },
      }),
      this.prisma.moduleResource.count({
        where: {
          module: {
            courseId,
          },
        },
      }),
      this.prisma.enrollment.count({
        where: { courseId },
      }),
    ]);

    return {
      success: true,
      data: {
        assignmentsCount,
        modulesCount,
        resourcesCount,
        enrolledStudentsCount,
      },
      message: 'Course statistics retrieved successfully',
    };
  }
}
