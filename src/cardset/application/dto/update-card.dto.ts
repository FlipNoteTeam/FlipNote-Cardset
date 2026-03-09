import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCardDto {
  @ApiPropertyOptional({ example: '수정된 내용' })
  content?: string;

  @ApiPropertyOptional({ example: 2 })
  order?: number;
}
