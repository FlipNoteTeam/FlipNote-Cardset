import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './domain/auth.service';
import { WsAuthGuard } from './infrastructure/guard/ws-auth.guard';
import authConfig from '../shared/config/auth.config';

@Module({
  imports: [ConfigModule.forFeature(authConfig)],
  providers: [AuthService, WsAuthGuard],
  exports: [AuthService, WsAuthGuard],
})
export class AuthModule {}
