export class Card {
  constructor(
    public readonly id: number,
    public content: string,
    public order: number,
    public readonly cardsetId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date,
  ) {}

  static create(props: {
    content?: string;
    order: number;
    cardsetId: number;
  }): Card {
    return new Card(
      0,
      props.content ?? '',
      props.order,
      props.cardsetId,
      new Date(),
      new Date(),
    );
  }

  updateContent(content: string): Card {
    return new Card(
      this.id,
      content,
      this.order,
      this.cardsetId,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }

  changeOrder(order: number): Card {
    return new Card(
      this.id,
      this.content,
      order,
      this.cardsetId,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
  }
}
