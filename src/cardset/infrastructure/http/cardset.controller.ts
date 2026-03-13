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
import { CardsetUseCase } from '../../application/cardset.use-case';
import { CreateCardsetRequest } from '../../application/dto/request/create-cardset.request';
import { UpdateCardsetRequest } from '../../application/dto/request/update-cardset.request';
import { CardsetCreateResponse } from '../../application/dto/response/cardset-create.response';
import { CardsetResponse } from '../../application/dto/response/cardset.response';

@Controller('cardsets')
export class CardsetController {
  constructor(private readonly cardsetUseCase: CardsetUseCase) {}

  @Post()
  async create(
    @Headers('X-USER-ID') userId: string,
    @Body() dto: CreateCardsetRequest,
  ): Promise<CardsetCreateResponse> {
    const cardset = await this.cardsetUseCase.create(parseInt(userId), dto);
    return CardsetCreateResponse.from(cardset.id);
  }

  @Get()
  async findAll(
    @Headers('X-USER-ID') userId: string,
  ): Promise<CardsetResponse[]> {
    const cardsets = await this.cardsetUseCase.findAll(parseInt(userId));
    return cardsets.map((c) => CardsetResponse.from(c));
  }

  @Get(':cardsetId')
  async findOne(
    @Headers('X-USER-ID') userId: string,
    @Param('cardsetId') cardsetId: string,
  ): Promise<CardsetResponse | null> {
    const cardset = await this.cardsetUseCase.findOne(parseInt(cardsetId), parseInt(userId));
    return cardset ? CardsetResponse.from(cardset) : null;
  }

  @Put(':cardsetId')
  async update(
    @Headers('X-USER-ID') userId: string,
    @Param('cardsetId') cardsetId: string,
    @Body() dto: UpdateCardsetRequest,
  ): Promise<CardsetResponse | null> {
    const cardset = await this.cardsetUseCase.update(
      parseInt(cardsetId),
      parseInt(userId),
      dto,
    );
    return cardset ? CardsetResponse.from(cardset) : null;
  }

  @Delete(':cardsetId')
  async remove(
    @Headers('X-USER-ID') userId: string,
    @Param('cardsetId') cardsetId: string,
  ): Promise<void> {
    return this.cardsetUseCase.remove(parseInt(cardsetId), parseInt(userId));
  }

  @Put(':cardsetId/card-count')
  async updateCardCount(
    @Headers('X-USER-ID') userId: string,
    @Param('cardsetId') cardsetId: string,
    @Body() body: { cardCount: number },
  ): Promise<CardsetResponse | null> {
    const cardset = await this.cardsetUseCase.updateCardCount(
      parseInt(cardsetId),
      parseInt(userId),
      body.cardCount,
    );
    return cardset ? CardsetResponse.from(cardset) : null;
  }
}
