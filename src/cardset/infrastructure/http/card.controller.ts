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
import { ApiResponse } from '../../../shared/common/api-response';

@Controller('cards')
export class CardController {
  constructor(private readonly cardUseCase: CardUseCase) {}

  @Post()
  async create(
    @Headers('X-USER-ID') _userId: string,
    @Body() dto: CreateCardRequest,
  ): Promise<ApiResponse<CardCreateResponse>> {
    const card = await this.cardUseCase.create(dto);
    return ApiResponse.created(CardCreateResponse.from(card.id));
  }

  @Get('cardset/:cardsetId')
  async findByCardsetId(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardsetId') cardsetId: string,
  ): Promise<ApiResponse<CardResponse[]>> {
    const cards = await this.cardUseCase.findAllByCardsetId(
      parseInt(cardsetId),
    );
    return ApiResponse.success(cards.map((c) => CardResponse.from(c)));
  }

  @Get(':cardId')
  async findOne(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardId') cardId: string,
  ): Promise<ApiResponse<CardResponse | null>> {
    const card = await this.cardUseCase.findOne(parseInt(cardId));
    return ApiResponse.success(card ? CardResponse.from(card) : null);
  }

  @Put('reorder')
  async reorderCards(
    @Headers('X-USER-ID') _userId: string,
    @Body() dto: ReorderCardsRequest,
  ): Promise<ApiResponse<null>> {
    await this.cardUseCase.reorderCards(dto.cardOrders);
    return ApiResponse.success(null);
  }

  @Put(':cardId')
  async update(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardRequest,
  ): Promise<ApiResponse<CardResponse | null>> {
    const card = await this.cardUseCase.update(parseInt(cardId), dto);
    return ApiResponse.success(card ? CardResponse.from(card) : null);
  }

  @Delete(':cardId')
  async remove(
    @Headers('X-USER-ID') _userId: string,
    @Param('cardId') cardId: string,
  ): Promise<ApiResponse<null>> {
    await this.cardUseCase.remove(parseInt(cardId));
    return ApiResponse.success(null, '삭제되었습니다.');
  }
}
