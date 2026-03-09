import { ApiProperty } from '@nestjs/swagger';

class CardOrderItem {
  @ApiProperty({ example: 1 })
  cardId!: number;

  @ApiProperty({ example: 2 })
  order!: number;
}

export class ReorderCardsDto {
  @ApiProperty({ type: [CardOrderItem] })
  cardOrders!: CardOrderItem[];
}
