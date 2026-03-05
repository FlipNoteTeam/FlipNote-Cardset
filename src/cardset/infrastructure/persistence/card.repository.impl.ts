import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICardRepository } from '../../domain/repository/card.repository';
import { Card } from '../../domain/model/card';
import { CardOrmEntity } from './orm/card.orm-entity';
import { CardMapper } from './mapper/card.mapper';

@Injectable()
export class CardRepositoryImpl implements ICardRepository {
  constructor(
    @InjectRepository(CardOrmEntity)
    private readonly ormRepository: Repository<CardOrmEntity>,
  ) {}

  async findById(id: number): Promise<Card | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? CardMapper.toDomain(orm) : null;
  }

  async findAllByCardsetId(cardsetId: number): Promise<Card[]> {
    const orms = await this.ormRepository.find({
      where: { cardsetId },
      order: { order: 'ASC' },
    });
    return orms.map(CardMapper.toDomain);
  }

  async save(card: Card): Promise<Card> {
    const ormData = CardMapper.toOrm(card);
    const created = this.ormRepository.create(ormData);
    const saved = await this.ormRepository.save(created);
    return CardMapper.toDomain(saved);
  }

  async update(id: number, card: Partial<Card>): Promise<Card | null> {
    await this.ormRepository.update(id, CardMapper.toOrm(card as Card));
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async updateOrder(cardId: number, order: number): Promise<void> {
    await this.ormRepository.update(cardId, { order });
  }
}
