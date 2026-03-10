import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cardset } from '../domain/model/cardset';
import { CardsetManager } from '../domain/model/cardset-manager';
import { CARDSET_REPOSITORY } from '../domain/repository/cardset.repository';
import type { ICardsetRepository } from '../domain/repository/cardset.repository';
import { CARD_REPOSITORY } from '../domain/repository/card.repository';
import type { ICardRepository } from '../domain/repository/card.repository';
import { CARDSET_MANAGER_REPOSITORY } from '../domain/repository/cardset-manager.repository';
import type { ICardsetManagerRepository } from '../domain/repository/cardset-manager.repository';
import { CardsetCardDomainService } from '../domain/service/cardset-card.domain-service';
import { GroupGrpcClient } from '../infrastructure/grpc/group-grpc.client';
import { CreateCardsetRequest } from './dto/request/create-cardset.request';
import { UpdateCardsetRequest } from './dto/request/update-cardset.request';

@Injectable()
export class CardsetUseCase {
  constructor(
    @Inject(CARDSET_REPOSITORY)
    private readonly cardsetRepository: ICardsetRepository,
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: ICardRepository,
    @Inject(CARDSET_MANAGER_REPOSITORY)
    private readonly cardsetManagerRepository: ICardsetManagerRepository,
    private readonly cardsetCardDomainService: CardsetCardDomainService,
    private readonly groupGrpcClient: GroupGrpcClient,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateCardsetRequest): Promise<Cardset> {
    await this.groupGrpcClient.checkUserInGroup(dto.groupId, userId);

    return this.dataSource.transaction(async (manager) => {
      const cardset = Cardset.create(dto);
      const savedCardset = await this.cardsetRepository.save(cardset, manager);

      const cardCount = dto.cardCount ?? 10;
      const cardsToAdd = this.cardsetCardDomainService.buildCardsToAdd(
        savedCardset.id,
        0,
        cardCount,
      );
      for (const card of cardsToAdd) {
        await this.cardRepository.save(card, manager);
      }

      const cardsetManager = CardsetManager.create({
        userId,
        cardSetId: savedCardset.id,
      });
      await this.cardsetManagerRepository.save(cardsetManager, manager);

      return savedCardset;
    });
  }

  async findAll(): Promise<Cardset[]> {
    return this.cardsetRepository.findAll();
  }

  async findOne(id: number): Promise<Cardset | null> {
    return this.cardsetRepository.findById(id);
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateCardsetRequest,
  ): Promise<Cardset | null> {
    const cardset = await this.cardsetRepository.findById(id);
    if (!cardset) return null;

    await this.groupGrpcClient.checkUserInGroup(cardset.groupId, userId);

    return this.cardsetRepository.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    return this.cardsetRepository.delete(id);
  }

  async updateCardCount(id: number, newCardCount: number): Promise<Cardset | null> {
    return this.dataSource.transaction(async (manager) => {
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
          await this.cardRepository.save(card, manager);
        }
      } else if (newCardCount < currentCount) {
        const cardsToRemove = this.cardsetCardDomainService.selectCardsToRemove(
          currentCards,
          newCardCount,
        );
        for (const card of cardsToRemove) {
          await this.cardRepository.delete(card.id, manager);
        }
      }

      const updatedCardset = cardset.changeCardCount(newCardCount);
      return this.cardsetRepository.update(id, updatedCardset);
    });
  }
}
