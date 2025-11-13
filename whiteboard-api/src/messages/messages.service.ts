import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId: createMessageDto.receiverId,
        content: createMessageDto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Create notification for receiver
    const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
    await this.notificationsService.notifyNewMessage(
      createMessageDto.receiverId,
      senderId,
      senderName,
    );

    return {
      success: true,
      data: message,
      message: 'Message sent successfully',
    };
  }

  async findConversations(userId: string) {
    // Get all messages where user is sender or receiver
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, deletedBySender: false },
          { receiverId: userId, deletedByReceiver: false },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const partnerId =
        message.senderId === userId ? message.receiverId : message.senderId;
      const partner =
        message.senderId === userId ? message.receiver : message.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    return {
      success: true,
      data: {
        conversations,
        total: conversations.length,
      },
      message: 'Conversations retrieved successfully',
    };
  }

  async findConversationMessages(userId: string, partnerId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: partnerId,
            deletedBySender: false,
          },
          {
            senderId: partnerId,
            receiverId: userId,
            deletedByReceiver: false,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        sentAt: 'asc',
      },
    });

    return {
      success: true,
      data: {
        messages,
        total: messages.length,
      },
      message: 'Messages retrieved successfully',
    };
  }

  async markAsRead(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // Only receiver can mark as read
    if (message.receiverId !== userId) {
      throw new ForbiddenException(
        'You can only mark messages you received as read',
      );
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      success: true,
      data: updatedMessage,
      message: 'Message marked as read',
    };
  }

  async update(id: string, userId: string, updateMessageDto: UpdateMessageDto) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // User can only update their own messages
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You can only update your own messages');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
    });

    return {
      success: true,
      data: updatedMessage,
      message: 'Message updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // Mark as deleted for the appropriate user
    if (message.senderId === userId) {
      await this.prisma.message.update({
        where: { id },
        data: { deletedBySender: true },
      });
      return {
        success: true,
        message: 'Message deleted successfully',
      };
    } else if (message.receiverId === userId) {
      await this.prisma.message.update({
        where: { id },
        data: { deletedByReceiver: true },
      });
      return {
        success: true,
        message: 'Message deleted successfully',
      };
    } else {
      throw new ForbiddenException('You can only delete your own messages');
    }
  }

  /**
   * Get all users that the current user can message
   * - For students: returns instructors and classmates from their enrolled courses
   * - For instructors: returns students enrolled in their courses
   */
  async getMessageableUsers(userId: string) {
    // Get the current user with their role
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const userRole = currentUser.role.toUpperCase();

    if (userRole === 'STUDENT') {
      // Get all courses the student is enrolled in
      const enrollments = await this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  role: true,
                },
              },
              enrollments: {
                where: {
                  userId: { not: userId }, // Exclude self
                },
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      avatar: true,
                      role: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Collect all unique users (instructors and classmates)
      const usersMap = new Map();

      enrollments.forEach((enrollment) => {
        const course = enrollment.course;

        // Add instructor
        if (course.instructor) {
          usersMap.set(course.instructor.id, {
            ...course.instructor,
            courseTitle: course.title,
            courseCode: course.code,
          });
        }

        // Add classmates
        course.enrollments.forEach((e) => {
          if (e.user && !usersMap.has(e.user.id)) {
            usersMap.set(e.user.id, {
              ...e.user,
              courseTitle: course.title,
              courseCode: course.code,
            });
          }
        });
      });

      const users = Array.from(usersMap.values());

      return {
        success: true,
        data: {
          users,
          total: users.length,
        },
        message: 'Messageable users retrieved successfully',
      };
    } else if (userRole === 'INSTRUCTOR' || userRole === 'ADMIN') {
      // Get all courses taught by the instructor
      const courses = await this.prisma.course.findMany({
        where: { instructorId: userId },
        include: {
          enrollments: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // Collect all unique students
      const usersMap = new Map();

      courses.forEach((course) => {
        course.enrollments.forEach((enrollment) => {
          if (!usersMap.has(enrollment.user.id)) {
            usersMap.set(enrollment.user.id, {
              ...enrollment.user,
              courseTitle: course.title,
              courseCode: course.code,
            });
          }
        });
      });

      const users = Array.from(usersMap.values());

      return {
        success: true,
        data: {
          users,
          total: users.length,
        },
        message: 'Messageable users retrieved successfully',
      };
    }

    return {
      success: true,
      data: {
        users: [],
        total: 0,
      },
      message: 'No messageable users found',
    };
  }
}
