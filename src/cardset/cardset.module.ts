import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cardset } from './entities/cardset.entity';
import { CardsetService } from './cardset.service';
import { CardsetController } from './cardset.controller';
import { CardModule } from '../card/card.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cardset]), CardModule],
  controllers: [CardsetController],
  providers: [CardsetService],
  exports: [CardsetService],
})
export class CardsetModule {}