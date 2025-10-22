import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cardset } from './entities/cardset.entity';
import { CardService } from '../card/card.service';

@Injectable()
export class CardsetService {
  constructor(
    @InjectRepository(Cardset)
    private cardsetRepository: Repository<Cardset>,
    private cardService: CardService,
  ) {}

  async create(cardsetData: Partial<Cardset>): Promise<Cardset> {
    const cardset = this.cardsetRepository.create(cardsetData);
    const savedCardset = await this.cardsetRepository.save(cardset);
    
    // 지정된 개수만큼 빈 카드 생성
    const cardCount = cardsetData.cardCount || 10;
    for (let i = 0; i < cardCount; i++) {
      await this.cardService.create({
        content: '',
        order: i,
        cardsetId: savedCardset.id,
      });
    }
    
    return savedCardset;
  }

  async findAll(): Promise<Cardset[]> {
    return await this.cardsetRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Cardset | null> {
    return await this.cardsetRepository.findOne({
      where: { id },
    });
  }

  async update(id: number, updateData: Partial<Cardset>): Promise<Cardset | null> {
    await this.cardsetRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.cardsetRepository.delete(id);
  }

  async updateCardCount(id: number, newCardCount: number): Promise<Cardset | null> {
    const cardset = await this.findOne(id);
    if (!cardset) return null;

    const currentCards = await this.cardService.findAllByCardsetId(id);
    const currentCount = currentCards.length;

    if (newCardCount > currentCount) {
      // 카드 추가
      for (let i = currentCount; i < newCardCount; i++) {
        await this.cardService.create({
          content: '',
          order: i,
          cardsetId: id,
        });
      }
    } else if (newCardCount < currentCount) {
      // 카드 삭제 (뒤에서부터)
      const cardsToDelete = currentCards.slice(newCardCount);
      for (const card of cardsToDelete) {
        await this.cardService.remove(card.id);
      }
    }

    // 카드셋의 cardCount 업데이트
    await this.cardsetRepository.update(id, { cardCount: newCardCount });
    return await this.findOne(id);
  }
}