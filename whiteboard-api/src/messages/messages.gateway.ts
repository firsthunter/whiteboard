import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'messages',
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log('Client connected to messages:', client.id);
  }

  handleDisconnect(client: Socket) {
    // Remove from user sockets map
    const userId = Array.from(this.userSockets.entries()).find(
      ([_, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.userSockets.delete(userId);
    }
    console.log('Client disconnected from messages:', client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    client.join(`user:${data.userId}`);
    return { event: 'registered', data: { userId: data.userId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const createMessageDto: CreateMessageDto = {
        receiverId: data.receiverId,
        content: data.content,
      };

      const message = await this.messagesService.create(
        data.senderId,
        createMessageDto,
      );

      // Emit to sender
      this.server.to(`user:${data.senderId}`).emit('messageSent', message);

      // Emit to receiver
      this.server.to(`user:${data.receiverId}`).emit('messageReceived', message);

      return { event: 'messageSent', data: message };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { senderId: string; receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    // Emit typing indicator to receiver
    this.server.to(`user:${data.receiverId}`).emit('userTyping', {
      userId: data.senderId,
      isTyping: data.isTyping,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.messagesService.markAsRead(
        data.messageId,
        data.userId,
      );

      // Notify sender that message was read
      this.server.to(`user:${message.senderId}`).emit('messageRead', {
        messageId: data.messageId,
        readBy: data.userId,
      });

      return { event: 'markedAsRead', data: message };
    } catch (error) {
      return { event: 'error', data: { message: error.message } };
    }
  }

  // Method to emit new message from service
  emitNewMessage(receiverId: string, message: any) {
    this.server.to(`user:${receiverId}`).emit('messageReceived', message);
  }

  // Method to emit message read status
  emitMessageRead(senderId: string, messageId: string, readBy: string) {
    this.server.to(`user:${senderId}`).emit('messageRead', {
      messageId,
      readBy,
    });
  }
}
