import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';
import { MailerService } from '../common/mailer.service';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
    @Inject(forwardRef(() => MailerService))
    private mailerService: MailerService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      },
    });

    // Emit real-time notification
    this.notificationsGateway.emitToUser(dto.userId, notification);

    return notification;
  }

  async createMany(dtos: CreateNotificationDto[]) {
    // Create notifications individually to get IDs for real-time emission
    const notifications = await Promise.all(
      dtos.map(async (dto) => {
        const notification = await this.prisma.notification.create({
          data: {
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            data: dto.data || {},
          },
        });

        // Emit real-time notification for each user
        this.notificationsGateway.emitToUser(dto.userId, notification);

        return notification;
      }),
    );

    return notifications;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    };
  }

  async findUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // Helper methods for creating specific notification types

  async notifyNewMessage(
    receiverId: string,
    senderId: string,
    senderName: string,
  ) {
    return this.create({
      userId: receiverId,
      type: 'MESSAGE',
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      data: { senderId },
    });
  }

  async notifyAssignmentCreated(
    studentIds: string[],
    courseTitle: string,
    assignmentTitle: string,
    assignmentId: string,
    dueDate: Date,
  ) {
    const dtos: CreateNotificationDto[] = studentIds.map((studentId) => ({
      userId: studentId,
      type: 'ASSIGNMENT_CREATED',
      title: 'New Assignment',
      message: `New assignment "${assignmentTitle}" in ${courseTitle}. Due: ${dueDate.toLocaleDateString()}`,
      data: { assignmentId, courseTitle, dueDate: dueDate.toISOString() },
    }));

    // Send emails to students with email notifications enabled
    const users = await this.prisma.user.findMany({
      where: { id: { in: studentIds } },
      include: { settings: true },
    });

    for (const user of users) {
      if (
        user.settings?.emailNotifications &&
        user.settings?.assignmentNotifications
      ) {
        await this.mailerService.sendAssignmentCreatedEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          courseTitle,
          assignmentTitle,
          dueDate,
        );
      }
    }

    return this.createMany(dtos);
  }

  async notifySubmissionReceived(
    instructorId: string,
    studentName: string,
    assignmentTitle: string,
    submissionId: string,
    courseTitle: string,
  ) {
    // Send email to instructor
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
      include: { settings: true },
    });

    if (
      instructor?.settings?.emailNotifications &&
      instructor.settings?.assignmentNotifications
    ) {
      await this.mailerService.sendSubmissionReceivedEmail(
        instructor.email,
        `${instructor.firstName} ${instructor.lastName}`,
        studentName,
        assignmentTitle,
        courseTitle,
      );
    }

    return this.create({
      userId: instructorId,
      type: 'SUBMISSION_RECEIVED',
      title: 'New Submission',
      message: `${studentName} submitted "${assignmentTitle}"`,
      data: { submissionId, assignmentTitle },
    });
  }

  async notifySubmissionGraded(
    studentId: string,
    assignmentTitle: string,
    grade: number,
    submissionId: string,
    maxPoints: number,
    feedback?: string,
  ) {
    // Send email to student
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { settings: true },
    });

    if (
      student?.settings?.emailNotifications &&
      student.settings?.assignmentNotifications
    ) {
      await this.mailerService.sendSubmissionGradedEmail(
        student.email,
        `${student.firstName} ${student.lastName}`,
        assignmentTitle,
        grade,
        maxPoints,
        feedback,
      );
    }

    return this.create({
      userId: studentId,
      type: 'SUBMISSION_GRADED',
      title: 'Assignment Graded',
      message: `Your submission for "${assignmentTitle}" has been graded: ${grade}/${maxPoints}`,
      data: { submissionId, assignmentTitle, grade, maxPoints, feedback },
    });
  }

  async notifyAnnouncement(
    studentIds: string[],
    courseTitle: string,
    announcementTitle: string,
    announcementId: string,
  ) {
    const dtos: CreateNotificationDto[] = studentIds.map((studentId) => ({
      userId: studentId,
      type: 'ANNOUNCEMENT',
      title: 'New Announcement',
      message: `New announcement in ${courseTitle}: ${announcementTitle}`,
      data: { announcementId, courseTitle },
    }));

    return this.createMany(dtos);
  }

  async notifyAssignmentDueSoon(
    studentId: string,
    assignmentTitle: string,
    assignmentId: string,
    dueDate: Date,
  ) {
    return this.create({
      userId: studentId,
      type: 'ASSIGNMENT_DUE_SOON',
      title: 'Assignment Due Soon',
      message: `"${assignmentTitle}" is due on ${dueDate.toLocaleDateString()}`,
      data: { assignmentId, dueDate: dueDate.toISOString() },
    });
  }

  async notifyCourseEnrollment(
    studentId: string,
    courseTitle: string,
    courseId: string,
  ) {
    return this.create({
      userId: studentId,
      type: 'ENROLLMENT',
      title: 'Course Enrollment',
      message: `You have been enrolled in ${courseTitle}`,
      data: { courseId },
    });
  }

  async notifyModuleCompleted(
    studentId: string,
    moduleTitle: string,
    courseTitle: string,
    moduleId: string,
  ) {
    // Send email to student
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { settings: true },
    });

    if (student?.settings?.emailNotifications) {
      await this.mailerService.sendModuleCompletedEmail(
        student.email,
        `${student.firstName} ${student.lastName}`,
        moduleTitle,
        courseTitle,
      );
    }

    return this.create({
      userId: studentId,
      type: 'COURSE_UPDATE',
      title: 'Module Completed',
      message: `Congratulations! You completed "${moduleTitle}" in ${courseTitle}`,
      data: { moduleId, moduleTitle, courseTitle },
    });
  }

  async notifyCourseCompleted(
    studentId: string,
    courseTitle: string,
    courseId: string,
    completionRate: number,
  ) {
    // Send email to student
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { settings: true },
    });

    if (student?.settings?.emailNotifications) {
      await this.mailerService.sendCourseCompletedEmail(
        student.email,
        `${student.firstName} ${student.lastName}`,
        courseTitle,
        completionRate,
      );
    }

    return this.create({
      userId: studentId,
      type: 'COURSE_UPDATE',
      title: 'Course Completed',
      message: `🎓 Congratulations! You completed ${courseTitle} with ${completionRate}% completion rate!`,
      data: { courseId, courseTitle, completionRate },
    });
  }

  async notifyQuizCompleted(
    studentId: string,
    quizTitle: string,
    courseTitle: string,
    score: number,
    maxScore: number,
    quizId: string,
  ) {
    // Send email to student
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { settings: true },
    });

    if (student?.settings?.emailNotifications) {
      await this.mailerService.sendQuizCompletedEmail(
        student.email,
        `${student.firstName} ${student.lastName}`,
        quizTitle,
        courseTitle,
        score,
        maxScore,
      );
    }

    return this.create({
      userId: studentId,
      type: 'COURSE_UPDATE',
      title: 'Quiz Completed',
      message: `You completed "${quizTitle}" in ${courseTitle}. Score: ${score}/${maxScore}`,
      data: { quizId, quizTitle, courseTitle, score, maxScore },
    });
  }
}
