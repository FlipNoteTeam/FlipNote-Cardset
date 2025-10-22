import { Module } from '@nestjs/common';
import { CollaborationGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway],
})
export class WebSocketModule {}