import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Card } from '../../../domain/model/card';

export class CardResponse {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiPropertyOptional({ example: '안녕하세요' })
  content!: string;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ example: 1 })
  cardsetId!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static from(card: Card): CardResponse {
    const res = new CardResponse();
    res.id = card.id;
    res.content = card.content;
    res.order = card.order;
    res.cardsetId = card.cardsetId;
    res.createdAt = card.createdAt;
    res.updatedAt = card.updatedAt;
    return res;
  }
}
