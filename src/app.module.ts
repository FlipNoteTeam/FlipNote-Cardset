import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CardsetModule } from './cardset/cardset.module';
import { CardModule } from './card/card.module';
import { Cardset } from './cardset/entities/cardset.entity';
import { Card } from './card/entities/card.entity';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Cardset, Card],
      synchronize: true, // 테이블 자동 생성
    }),
    CardsetModule,
    CardModule,
    WebSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
