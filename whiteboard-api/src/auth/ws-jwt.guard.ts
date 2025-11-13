import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        console.error('❌ WsJwtGuard: No token found');
        throw new WsException('Unauthorized');
      }

      const jwtSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
      if (!jwtSecret) {
        console.error('❌ WsJwtGuard: JWT_ACCESS_SECRET not configured');
        throw new WsException('Server configuration error');
      }

      const payload = this.jwtService.verify(token, {
        secret: jwtSecret,
      });

      // Attach user info to socket for later use
      client.data.user = payload;
      console.log('✅ WsJwtGuard: Token verified for user:', payload.sub);
      return true;
    } catch (error) {
      console.error('❌ WsJwtGuard: Error verifying token:', error.message);
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (!authHeader) {
      // Also check query params for token
      return (
        client.handshake.auth?.token ||
        (client.handshake.query?.token as string)
      );
    }

    const [type, token] = authHeader.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
