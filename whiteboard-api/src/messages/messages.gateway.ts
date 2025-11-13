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
  async handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(
      `👤 User registering for messages: ${data.userId} (socket: ${client.id})`,
    );
    this.userSockets.set(data.userId, client.id);
    await client.join(`user:${data.userId}`);
    console.log(`✅ User ${data.userId} joined room: user:${data.userId}`);
    return { event: 'registered', data: { userId: data.userId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      content: string;
    },
  ) {
    try {
      console.log('📩 WebSocket sendMessage received:', data);

      const createMessageDto: CreateMessageDto = {
        receiverId: data.receiverId,
        content: data.content,
      };

      const result = await this.messagesService.create(
        data.senderId,
        createMessageDto,
      );

      const message = result.data;
      console.log('✅ Message created:', message.id);

      // Emit to sender
      console.log(`📤 Emitting to sender: user:${data.senderId}`);
      this.server.to(`user:${data.senderId}`).emit('messageSent', message);

      // Emit to receiver
      console.log(`📨 Emitting to receiver: user:${data.receiverId}`);
      this.server
        .to(`user:${data.receiverId}`)
        .emit('messageReceived', message);

      return { event: 'messageSent', data: message };
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      isTyping: boolean;
    },
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
  ) {
    try {
      const result = await this.messagesService.markAsRead(
        data.messageId,
        data.userId,
      );

      const message = result.data;

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
