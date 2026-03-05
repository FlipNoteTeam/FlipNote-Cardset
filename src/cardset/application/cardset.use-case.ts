import { Inject, Injectable } from '@nestjs/common';
import { Cardset } from '../domain/model/cardset';
import { CARDSET_REPOSITORY } from '../domain/repository/cardset.repository';
import type { ICardsetRepository } from '../domain/repository/cardset.repository';
import { CARD_REPOSITORY } from '../domain/repository/card.repository';
import type { ICardRepository } from '../domain/repository/card.repository';
import { CardsetCardDomainService } from '../domain/service/cardset-card.domain-service';
import { CreateCardsetDto } from './dto/create-cardset.dto';
import { UpdateCardsetDto } from './dto/update-cardset.dto';

@Injectable()
export class CardsetUseCase {
  constructor(
    @Inject(CARDSET_REPOSITORY)
    private readonly cardsetRepository: ICardsetRepository,
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
    private readonly cardsetCardDomainService: CardsetCardDomainService,
  ) {}

  async create(dto: CreateCardsetDto): Promise<Cardset> {
    const cardset = Cardset.create(dto);
    const savedCardset = await this.cardsetRepository.save(cardset);

    const cardCount = dto.cardCount ?? 10;
    const cardsToAdd = this.cardsetCardDomainService.buildCardsToAdd(
      savedCardset.id,
      0,
      cardCount,
    );
    for (const card of cardsToAdd) {
      await this.cardRepository.save(card);
    }

    return savedCardset;
  }

  async findAll(): Promise<Cardset[]> {
    return this.cardsetRepository.findAll();
  }

  async findOne(id: number): Promise<Cardset | null> {
    return this.cardsetRepository.findById(id);
  }

  async update(id: number, dto: UpdateCardsetDto): Promise<Cardset | null> {
    return this.cardsetRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    return this.cardsetRepository.delete(id);
  }

  async updateCardCount(id: number, newCardCount: number): Promise<Cardset | null> {
    const cardset = await this.cardsetRepository.findById(id);
    if (!cardset) return null;

    const currentCards = await this.cardRepository.findAllByCardsetId(id);
    const currentCount = currentCards.length;

    if (newCardCount > currentCount) {
      const cardsToAdd = this.cardsetCardDomainService.buildCardsToAdd(
        id,
        currentCount,
        newCardCount,
      );
      for (const card of cardsToAdd) {
        await this.cardRepository.save(card);
      }
    } else if (newCardCount < currentCount) {
      const cardsToRemove = this.cardsetCardDomainService.selectCardsToRemove(
        currentCards,
        newCardCount,
      );
      for (const card of cardsToRemove) {
        await this.cardRepository.delete(card.id);
      }
    }

    const updatedCardset = cardset.changeCardCount(newCardCount);
    return this.cardsetRepository.update(id, updatedCardset);
  }
}
