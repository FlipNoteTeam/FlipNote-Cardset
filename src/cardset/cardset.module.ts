import { Module } from '@nestjs/common';
import { CardsetService } from './cardset.service';
import { CardsetController } from './cardset.controller';

@Module({
  controllers: [CardsetController],
  providers: [CardsetService],
})
export class CardsetModule {}
