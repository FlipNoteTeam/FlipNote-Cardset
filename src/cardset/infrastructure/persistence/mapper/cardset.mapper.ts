import { Cardset } from '../../../domain/model/cardset';
import { CardsetOrmEntity } from '../orm/cardset.orm-entity';

export class CardsetMapper {
  static toDomain(orm: CardsetOrmEntity): Cardset {
    return new Cardset(
      orm.id,
      orm.name,
      orm.groupId,
      orm.publicVisible,
      orm.category,
      orm.hashtag ?? null,
      orm.imageUrl,
      orm.cardCount,
      orm.createdAt,
      orm.updatedAt,
      orm.deletedAt,
    );
  }

  static toOrm(domain: Cardset): Partial<CardsetOrmEntity> {
    return {
      id: domain.id || undefined,
      name: domain.name,
      groupId: domain.groupId,
      publicVisible: domain.publicVisible,
      category: domain.category,
      hashtag: domain.hashtag,
      imageUrl: domain.imageUrl,
      cardCount: domain.cardCount,
    };
  }
}
