import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { CardUseCase } from '../../application/card.use-case';
import { CreateCardDto } from '../../application/dto/create-card.dto';
import { UpdateCardDto } from '../../application/dto/update-card.dto';
import { Card } from '../../domain/model/card';

@Controller('cards')
export class CardController {
  constructor(private readonly cardUseCase: CardUseCase) {}

  @Post()
  async create(
    @Headers('X-USER-ID') _userId: string,
    @Body() dto: CreateCardDto,
  ): Promise<Card> {
    return this.cardUseCase.create(dto);
  }

  @Get('cardset/:cardsetId')
  async findByCardsetId(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardsetId') cardsetId: string,
  ): Promise<Card[]> {
    return this.cardUseCase.findAllByCardsetId(parseInt(cardsetId));
  }

  @Get(':id')
  async findOne(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
  ): Promise<Card | null> {
    return this.cardUseCase.findOne(parseInt(id));
  }

  @Put('reorder')
  async reorderCards(
    @Headers('X-USER-ID') _userId: string,
    @Body() cardOrders: { cardId: number; order: number }[],
  ): Promise<void> {
    return this.cardUseCase.reorderCards(cardOrders);
  }

  @Put(':id')
  async update(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
  ): Promise<Card | null> {
    return this.cardUseCase.update(parseInt(id), dto);
  }

  @Delete(':id')
  async remove(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.cardUseCase.remove(parseInt(id));
  }
}
