import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async create(cardData: Partial<Card>): Promise<Card> {
    const card = this.cardRepository.create(cardData);
    return await this.cardRepository.save(card);
  }

  async findAllByCardsetId(cardsetId: number): Promise<Card[]> {
    return await this.cardRepository.find({
      where: { cardsetId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Card | null> {
    return await this.cardRepository.findOne({ where: { id } });
  }

  async update(id: number, updateData: Partial<Card>): Promise<Card | null> {
    await this.cardRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cardRepository.delete(id);
  }

  async reorderCards(cardOrders: { cardId: number; order: number }[]): Promise<void> {
    for (const { cardId, order } of cardOrders) {
      await this.cardRepository.update(cardId, { order });
    }
  }
}