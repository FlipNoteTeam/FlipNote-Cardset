import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Card } from '../domain/model/card';
import { CARD_REPOSITORY } from '../domain/repository/card.repository';
import type { ICardRepository } from '../domain/repository/card.repository';
import { CreateCardRequest } from './dto/request/create-card.request';
import { UpdateCardRequest } from './dto/request/update-card.request';

@Injectable()
export class CardUseCase {
  constructor(
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCardRequest): Promise<Card> {
    const card = Card.create(dto);
    return this.cardRepository.save(card);
  }

  async findAllByCardsetId(cardsetId: number): Promise<Card[]> {
    return this.cardRepository.findAllByCardsetId(cardsetId);
  }

  async findOne(id: number): Promise<Card | null> {
    return this.cardRepository.findById(id);
  }

  async update(id: number, dto: UpdateCardRequest): Promise<Card | null> {
    return this.cardRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    return this.cardRepository.delete(id);
  }

  async reorderCards(cardOrders: { cardId: number; order: number }[]): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      for (const { cardId, order } of cardOrders) {
        await this.cardRepository.updateOrder(cardId, order, manager);
      }
    });
  }
}
