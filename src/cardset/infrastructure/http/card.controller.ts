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
import { CreateCardRequest } from '../../application/dto/request/create-card.request';
import { UpdateCardRequest } from '../../application/dto/request/update-card.request';
import { ReorderCardsRequest } from '../../application/dto/request/reorder-cards.request';
import { CardCreateResponse } from '../../application/dto/response/card-create.response';
import { CardResponse } from '../../application/dto/response/card.response';

@Controller('cards')
export class CardController {
  constructor(private readonly cardUseCase: CardUseCase) {}

  @Post()
  async create(
    @Headers('X-USER-ID') _userId: string,
    @Body() dto: CreateCardRequest,
  ): Promise<CardCreateResponse> {
    const card = await this.cardUseCase.create(dto);
    return CardCreateResponse.from(card.id);
  }

  @Get('cardset/:cardsetId')
  async findByCardsetId(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardsetId') cardsetId: string,
  ): Promise<CardResponse[]> {
    const cards = await this.cardUseCase.findAllByCardsetId(
      parseInt(cardsetId),
    );
    return cards.map((c) => CardResponse.from(c));
  }

  @Get(':cardId')
  async findOne(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardId') cardId: string,
  ): Promise<CardResponse | null> {
    const card = await this.cardUseCase.findOne(parseInt(cardId));
    return card ? CardResponse.from(card) : null;
  }

  @Put('reorder')
  async reorderCards(
    @Headers('X-USER-ID') _userId: string,
    @Body() dto: ReorderCardsRequest,
  ): Promise<void> {
    return this.cardUseCase.reorderCards(dto.cardOrders);
  }

  @Put(':cardId')
  async update(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardRequest,
  ): Promise<CardResponse | null> {
    const card = await this.cardUseCase.update(parseInt(cardId), dto);
    return card ? CardResponse.from(card) : null;
  }

  @Delete(':cardId')
  async remove(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardId') cardId: string,
  ): Promise<void> {
    return this.cardUseCase.remove(parseInt(cardId));
  }
}
