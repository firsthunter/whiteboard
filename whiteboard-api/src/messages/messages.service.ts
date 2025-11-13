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

    return message;
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

    return Array.from(conversationsMap.values());
  }

  async findConversationMessages(userId: string, partnerId: string) {
    return this.prisma.message.findMany({
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

    return this.prisma.message.update({
      where: { id },
      data: { isRead: true },
    });
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

    return this.prisma.message.update({
      where: { id },
      data: updateMessageDto,
    });
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
      return this.prisma.message.update({
        where: { id },
        data: { deletedBySender: true },
      });
    } else if (message.receiverId === userId) {
      return this.prisma.message.update({
        where: { id },
        data: { deletedByReceiver: true },
      });
    } else {
      throw new ForbiddenException('You can only delete your own messages');
    }
  }
}
