import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
    CreateModuleDto,
    UpdateModuleDto,
    CreateResourceDto,
    UpdateResourceDto,
    UpdateResourceProgressDto,
    UpdateModuleProgressDto,
} from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  // ===== MODULE MANAGEMENT (Instructor) =====

  async createModule(userId: string, dto: CreateModuleDto) {
    // Verify user is the course instructor
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course || course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can create modules',
      );
    }

    // Auto-calculate the order based on existing modules
    const existingModules = await this.prisma.courseModule.findMany({
      where: { courseId: dto.courseId },
      select: { order: true },
      orderBy: { order: 'desc' },
      take: 1,
    });

    const nextOrder =
      existingModules.length > 0 ? existingModules[0].order + 1 : 0;

    const module = await this.prisma.courseModule.create({
      data: {
        courseId: dto.courseId,
        title: dto.title,
        description: dto.description,
        order: nextOrder,
        isPublished: dto.isPublished || false,
      },
      include: {
        resources: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: module,
      message: 'Module created successfully',
    };
  }

  async updateModule(userId: string, moduleId: string, dto: UpdateModuleDto) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can update modules',
      );
    }

    const updatedModule = await this.prisma.courseModule.update({
      where: { id: moduleId },
      data: dto,
      include: {
        resources: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: updatedModule,
      message: 'Module updated successfully',
    };
  }

  async deleteModule(userId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can delete modules',
      );
    }

    await this.prisma.courseModule.delete({
      where: { id: moduleId },
    });

    return {
      success: true,
      message: 'Module deleted successfully',
    };
  }

  // ===== RESOURCE MANAGEMENT (Instructor) =====

  async createResource(userId: string, dto: CreateResourceDto) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: dto.moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can create resources',
      );
    }

    // Auto-calculate the order based on existing resources
    const existingResources = await this.prisma.moduleResource.findMany({
      where: { moduleId: dto.moduleId },
      select: { order: true },
      orderBy: { order: 'desc' },
      take: 1,
    });

    const nextOrder =
      existingResources.length > 0 ? existingResources[0].order + 1 : 0;

    const resource = await this.prisma.moduleResource.create({
      data: {
        moduleId: dto.moduleId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        url: dto.url,
        content: dto.content,
        duration: dto.duration,
        order: nextOrder,
        isRequired: dto.isRequired ?? true,
      },
    });

    return {
      success: true,
      data: resource,
      message: 'Resource created successfully',
    };
  }

  async updateResource(
    userId: string,
    resourceId: string,
    dto: UpdateResourceDto,
  ) {
    const resource = await this.prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: { module: { include: { course: true } } },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.module.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can update resources',
      );
    }

    const updatedResource = await this.prisma.moduleResource.update({
      where: { id: resourceId },
      data: dto,
    });

    return {
      success: true,
      data: updatedResource,
      message: 'Resource updated successfully',
    };
  }

  async deleteResource(userId: string, resourceId: string) {
    const resource = await this.prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: { module: { include: { course: true } } },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (resource.module.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can delete resources',
      );
    }

    await this.prisma.moduleResource.delete({
      where: { id: resourceId },
    });

    return {
      success: true,
      message: 'Resource deleted successfully',
    };
  }

  // ===== STUDENT CONTENT ACCESS =====

  async getCourseModules(userId: string, courseId: string) {
    // Check if user is enrolled or is the instructor
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const isInstructor = course.instructorId === userId;

    if (!isInstructor) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { userId, courseId },
      });

      if (!enrollment) {
        throw new ForbiddenException('Not enrolled in this course');
      }
    }

    // Get modules with their resources and progress
    const modules = await this.prisma.courseModule.findMany({
      where: {
        courseId,
        ...(isInstructor ? {} : { isPublished: true }),
      },
      include: {
        resources: {
          orderBy: { order: 'asc' },
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
    });

    return {
      success: true,
      data: modules,
      message: 'Modules retrieved successfully',
    };
  }

  async getModuleById(userId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: {
        course: true,
        resources: {
          orderBy: { order: 'asc' },
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
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    // Check access
    const isInstructor = module.course.instructorId === userId;
    if (!isInstructor) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { userId, courseId: module.courseId },
      });

      if (!enrollment) {
        throw new ForbiddenException('Not enrolled in this course');
      }

      if (!module.isPublished) {
        throw new ForbiddenException('Module is not published yet');
      }
    }

    return {
      success: true,
      data: module,
      message: 'Module retrieved successfully',
    };
  }

  // ===== PROGRESS TRACKING (Student) =====

  async updateResourceProgress(
    userId: string,
    resourceId: string,
    dto: UpdateResourceProgressDto,
  ) {
    // Verify resource exists and user has access
    const resource = await this.prisma.moduleResource.findUnique({
      where: { id: resourceId },
      include: { module: { include: { course: true } } },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: resource.module.courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    // Update or create progress
    const progress = await this.prisma.resourceProgress.upsert({
      where: {
        userId_resourceId: { userId, resourceId },
      },
      update: {
        isCompleted: dto.isCompleted ?? undefined,
        completedAt: dto.isCompleted === true ? new Date() : undefined,
        timeSpent: dto.timeSpent ?? undefined,
        lastPosition: dto.lastPosition ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        userId,
        resourceId,
        isCompleted: dto.isCompleted || false,
        completedAt: dto.isCompleted ? new Date() : null,
        timeSpent: dto.timeSpent || 0,
        lastPosition: dto.lastPosition || 0,
      },
    });

    // Auto-update module progress if all resources are completed
    await this.checkAndUpdateModuleProgress(userId, resource.moduleId);

    // Update overall course enrollment progress
    await this.updateCourseProgress(userId, resource.module.courseId);

    return {
      success: true,
      data: progress,
      message: 'Resource progress updated successfully',
    };
  }

  async updateModuleProgress(
    userId: string,
    moduleId: string,
    dto: UpdateModuleProgressDto,
  ) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: module.courseId,
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    const progress = await this.prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: { userId, moduleId },
      },
      update: {
        isCompleted: dto.isCompleted ?? undefined,
        completedAt: dto.isCompleted === true ? new Date() : undefined,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        moduleId,
        isCompleted: dto.isCompleted || false,
        completedAt: dto.isCompleted ? new Date() : null,
      },
    });

    await this.updateCourseProgress(userId, module.courseId);

    return {
      success: true,
      data: progress,
      message: 'Module progress updated successfully',
    };
  }

  // Helper: Check if all resources in module are completed
  private async checkAndUpdateModuleProgress(userId: string, moduleId: string) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: {
        resources: {
          where: { isRequired: true },
          include: {
            progress: {
              where: { userId },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!module || module.resources.length === 0) return;

    const allCompleted = module.resources.every(
      (resource) =>
        resource.progress.length > 0 && resource.progress[0].isCompleted,
    );

    if (allCompleted) {
      const existingProgress = await this.prisma.moduleProgress.findUnique({
        where: {
          userId_moduleId: { userId, moduleId },
        },
      });

      // Only notify if this is the first time completing the module
      const wasNotCompleted =
        !existingProgress || !existingProgress.isCompleted;

      await this.prisma.moduleProgress.upsert({
        where: {
          userId_moduleId: { userId, moduleId },
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
        create: {
          userId,
          moduleId,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      // Send notification about module completion
      if (wasNotCompleted) {
        await this.notificationsService.notifyModuleCompleted(
          userId,
          module.title,
          module.course.title,
          moduleId,
        );
      }
    }
  }

  // Helper: Update overall course enrollment progress
  private async updateCourseProgress(userId: string, courseId: string) {
    const modules = await this.prisma.courseModule.findMany({
      where: { courseId, isPublished: true },
      include: {
        progress: {
          where: { userId },
        },
      },
    });

    if (modules.length === 0) return;

    const completedModules = modules.filter(
      (module) => module.progress.length > 0 && module.progress[0].isCompleted,
    ).length;

    const progressPercentage = Math.round(
      (completedModules / modules.length) * 100,
    );

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    const previousProgress = enrollment?.progress || 0;

    await this.prisma.enrollment.updateMany({
      where: { userId, courseId },
      data: { progress: progressPercentage },
    });

    // Notify when course is completed (100% progress)
    if (progressPercentage === 100 && previousProgress < 100) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      });

      if (course) {
        await this.notificationsService.notifyCourseCompleted(
          userId,
          course.title,
          courseId,
          progressPercentage,
        );
      }
    }
  }

  // ===== STATISTICS (Instructor) =====

  async getCourseStatistics(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== userId) {
      throw new ForbiddenException(
        'Only course instructors can view statistics',
      );
    }

    const [
      totalModules,
      publishedModules,
      totalResources,
      enrolledStudents,
      moduleCompletionStats,
    ] = await Promise.all([
      this.prisma.courseModule.count({ where: { courseId } }),
      this.prisma.courseModule.count({
        where: { courseId, isPublished: true },
      }),
      this.prisma.moduleResource.count({
        where: { module: { courseId } },
      }),
      this.prisma.enrollment.count({ where: { courseId } }),
      this.prisma.moduleProgress.groupBy({
        by: ['moduleId'],
        where: {
          module: { courseId },
          isCompleted: true,
        },
        _count: true,
      }),
    ]);

    return {
      success: true,
      data: {
        totalModules,
        publishedModules,
        totalResources,
        enrolledStudents,
        avgCompletionRate:
          moduleCompletionStats.length > 0
            ? moduleCompletionStats.reduce(
                (acc, stat) => acc + stat._count,
                0,
              ) / (enrolledStudents * publishedModules || 1)
            : 0,
      },
      message: 'Course analytics retrieved successfully',
    };
  }
}
