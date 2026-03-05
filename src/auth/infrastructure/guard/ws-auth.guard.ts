import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../../domain/auth.service';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();

    const bearer =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers?.authorization;

    const token =
      bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : bearer;

    if (!token) {
      this.logger.warn(`No token provided for client ${client.id}`);
      return false;
    }

    try {
      const user = this.authService.verify(token);
      (client.data as { user: unknown }).user = user;
      return true;
    } catch (error) {
      this.logger.warn(
        `Invalid token for client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }
}
