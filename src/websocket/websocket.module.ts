import { Module } from '@nestjs/common';
import { CollaborationGateway } from './websocket.gateway';

@Module({
  providers: [CollaborationGateway],
  exports: [],
})
export class WebSocketModule {}
