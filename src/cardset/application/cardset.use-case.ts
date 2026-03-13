import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BusinessException } from '../../shared/common/business.exception';
import { ErrorCode } from '../../shared/common/error-code';
import { Cardset } from '../domain/model/cardset';
import { CardsetManager } from '../domain/model/cardset-manager';
import { Visibility } from '../domain/model/visibility';
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

  private async checkIsManager(
    cardSetId: number,
    userId: number,
  ): Promise<void> {
    const manager =
      await this.cardsetManagerRepository.findByUserIdAndCardSetId(
        userId,
        cardSetId,
      );
    if (!manager) {
      throw new BusinessException(ErrorCode.CARDSET_MANAGER_REQUIRED);
    }
  }

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

  async findAll(userId: number): Promise<Cardset[]> {
    const cardsets = await this.cardsetRepository.findAll();
    const viewable: Cardset[] = [];
    for (const cardset of cardsets) {
      if (cardset.visibility === Visibility.PUBLIC) {
        viewable.push(cardset);
      } else {
        const inGroup = await this.groupGrpcClient.isUserInGroup(
          cardset.groupId,
          userId,
        );
        if (inGroup) viewable.push(cardset);
      }
    }
    return viewable;
  }

  async findOne(id: number, userId: number): Promise<Cardset | null> {
    const cardset = await this.cardsetRepository.findById(id);
    if (!cardset) return null;
    if (cardset.visibility === Visibility.PUBLIC) return cardset;
    const inGroup = await this.groupGrpcClient.isUserInGroup(
      cardset.groupId,
      userId,
    );
    if (!inGroup) throw new BusinessException(ErrorCode.CARDSET_ACCESS_DENIED);
    return cardset;
  }

  async update(
    id: number,
    userId: number,
    dto: UpdateCardsetRequest,
  ): Promise<Cardset | null> {
    const cardset = await this.cardsetRepository.findById(id);
    if (!cardset) throw new BusinessException(ErrorCode.CARDSET_NOT_FOUND);

    await this.checkIsManager(id, userId);

    return this.cardsetRepository.update(id, dto);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.checkIsManager(id, userId);
    return this.cardsetRepository.delete(id);
  }

  async isCardSetViewable(cardSetId: number, userId: number): Promise<boolean> {
    const cardset = await this.cardsetRepository.findById(cardSetId);
    if (!cardset) return false;
    if (cardset.visibility === Visibility.PUBLIC) return true;
    return this.groupGrpcClient.isUserInGroup(cardset.groupId, userId);
  }

  async getCardSetsByIds(cardSetIds: number[], userId: number): Promise<Cardset[]> {
    const cardsets = await this.cardsetRepository.findByIds(cardSetIds);
    const viewable: Cardset[] = [];
    for (const cardset of cardsets) {
      if (cardset.visibility === Visibility.PUBLIC) {
        viewable.push(cardset);
      } else {
        const inGroup = await this.groupGrpcClient.isUserInGroup(
          cardset.groupId,
          userId,
        );
        if (inGroup) viewable.push(cardset);
      }
    }
    return viewable;
  }

  async updateCardCount(
    id: number,
    userId: number,
    newCardCount: number,
  ): Promise<Cardset | null> {
    await this.checkIsManager(id, userId);

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
