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
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  handleConnection(client: Socket) {
    console.log('Client connected to notifications:', client.id);
  }

  handleDisconnect(client: Socket) {
    // Remove from user sockets map
    for (const [userId, socketIds] of this.userSockets.entries()) {
      socketIds.delete(client.id);
      if (socketIds.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    console.log('Client disconnected from notifications:', client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)!.add(client.id);
    client.join(`user:${data.userId}`);
    return { event: 'registered', data: { userId: data.userId } };
  }

  // Emit notification to specific user
  emitToUser(userId: string, notification: any) {
    console.log(
      `🔔 Emitting notification to user:${userId}`,
      notification.type,
    );
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Emit notification to multiple users
  emitToUsers(userIds: string[], notification: any) {
    console.log(
      `🔔 Emitting notification to ${userIds.length} users`,
      notification.type,
    );
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit('notification', notification);
    });
  }

  // Broadcast to all connected clients
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }
}
