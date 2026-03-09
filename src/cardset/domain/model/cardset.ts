import { BaseDomainEntity } from '../../../shared/domain/base.entity';

export class Cardset extends BaseDomainEntity {
  constructor(
    public readonly id: number,
    public name: string,
    public groupId: number,
    public publicVisible: boolean,
    public category: string,
    public hashtag: string | null,
    public imageUrl: string,
    public cardCount: number,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date,
  ) {
    super(createdAt, updatedAt, deletedAt);
  }

  static create(props: {
    name: string;
    groupId: number;
    publicVisible: boolean;
    category: string;
    hashtag?: string | null;
    imageUrl: string;
    cardCount?: number;
  }): Cardset {
    return new Cardset(
      0,
      props.name,
      props.groupId,
      props.publicVisible,
      props.category,
      props.hashtag ?? null,
      props.imageUrl,
      props.cardCount ?? 10,
      new Date(),
      new Date(),
    );
  }

  updateInfo(props: Partial<{
    name: string;
    publicVisible: boolean;
    category: string;
    hashtag: string | null;
    imageUrl: string;
  }>): Cardset {
    return new Cardset(
      this.id,
      props.name ?? this.name,
      this.groupId,
      props.publicVisible ?? this.publicVisible,
      props.category ?? this.category,
      props.hashtag !== undefined ? props.hashtag : this.hashtag,
      props.imageUrl ?? this.imageUrl,
      this.cardCount,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  changeCardCount(newCount: number): Cardset {
    return new Cardset(
      this.id,
      this.name,
      this.groupId,
      this.publicVisible,
      this.category,
      this.hashtag,
      this.imageUrl,
      newCount,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }
}
