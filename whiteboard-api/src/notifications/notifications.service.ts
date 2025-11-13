import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

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
    const notifications = await this.prisma.notification.createMany({
      data: dtos.map((dto) => ({
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      })),
    });

    // Emit to all users
    const userIds = dtos.map((dto) => dto.userId);
    this.notificationsGateway.emitToUsers(
      userIds,
      { message: 'New notifications available' },
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

  async notifyNewMessage(receiverId: string, senderId: string, senderName: string) {
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

    return this.createMany(dtos);
  }

  async notifySubmissionReceived(
    instructorId: string,
    studentName: string,
    assignmentTitle: string,
    submissionId: string,
  ) {
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
  ) {
    return this.create({
      userId: studentId,
      type: 'SUBMISSION_GRADED',
      title: 'Assignment Graded',
      message: `Your submission for "${assignmentTitle}" has been graded: ${grade}`,
      data: { submissionId, assignmentTitle, grade },
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
}
