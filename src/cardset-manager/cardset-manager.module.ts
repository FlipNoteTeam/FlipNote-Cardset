import { Module } from '@nestjs/common';
import { CardsetManagerService } from './cardset-manager.service';
import { CardsetManagerController } from './cardset-manager.controller';

@Module({
  controllers: [CardsetManagerController],
  providers: [CardsetManagerService],
})
export class CardsetManagerModule {}
