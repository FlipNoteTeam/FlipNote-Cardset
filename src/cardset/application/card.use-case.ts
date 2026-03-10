import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Card } from '../domain/model/card';
import { CARD_REPOSITORY } from '../domain/repository/card.repository';
import type { ICardRepository } from '../domain/repository/card.repository';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardUseCase {
  constructor(
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCardDto): Promise<Card> {
    const card = Card.create(dto);
    return this.cardRepository.save(card);
  }

  async findAllByCardsetId(cardsetId: number): Promise<Card[]> {
    return this.cardRepository.findAllByCardsetId(cardsetId);
  }

  async findOne(id: number): Promise<Card | null> {
    return this.cardRepository.findById(id);
  }

  async update(id: number, dto: UpdateCardDto): Promise<Card | null> {
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
