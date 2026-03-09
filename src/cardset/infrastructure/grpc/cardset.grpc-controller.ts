import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CardsetUseCase } from '../../application/cardset.use-case';
import type { GetCardsetRequest, CardsetGrpcResponse } from '../../../shared/grpc/grpc.types';

@Controller()
export class CardsetGrpcController {
  constructor(private readonly cardsetUseCase: CardsetUseCase) {}

  @GrpcMethod('CardsetService', 'GetCardset')
  async getCardset(data: GetCardsetRequest): Promise<CardsetGrpcResponse> {
    const cardset = await this.cardsetUseCase.findOne(data.id);

    if (!cardset) {
      throw new Error(`Cardset with id ${data.id} not found`);
    }

    return {
      id: cardset.id,
      name: cardset.name,
      groupId: cardset.groupId,
      publicVisible: cardset.publicVisible,
      category: cardset.category,
      hashtag: cardset.hashtag ?? '',
      imageUrl: cardset.imageUrl,
      cardCount: cardset.cardCount,
    };
  }
}
