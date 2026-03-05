import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICardsetRepository } from '../../domain/repository/cardset.repository';
import { Cardset } from '../../domain/model/cardset';
import { CardsetOrmEntity } from './orm/cardset.orm-entity';
import { CardsetMapper } from './mapper/cardset.mapper';

@Injectable()
export class CardsetRepositoryImpl implements ICardsetRepository {
  constructor(
    @InjectRepository(CardsetOrmEntity)
    private readonly ormRepository: Repository<CardsetOrmEntity>,
  ) {}

  async findAll(): Promise<Cardset[]> {
    const orms = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
    });
    return orms.map(CardsetMapper.toDomain);
  }

  async findById(id: number): Promise<Cardset | null> {
    const orm = await this.ormRepository.findOne({ where: { id } });
    return orm ? CardsetMapper.toDomain(orm) : null;
  }

  async save(cardset: Cardset): Promise<Cardset> {
    const ormData = CardsetMapper.toOrm(cardset);
    const created = this.ormRepository.create(ormData);
    const saved = await this.ormRepository.save(created);
    return CardsetMapper.toDomain(saved);
  }

  async update(id: number, cardset: Partial<Cardset>): Promise<Cardset | null> {
    await this.ormRepository.update(id, CardsetMapper.toOrm(cardset as Cardset));
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
