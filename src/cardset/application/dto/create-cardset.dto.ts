import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '../../domain/model/visibility';

export class CreateCardsetDto {
  @ApiProperty({ example: '영어 단어장' })
  name!: string;

  @ApiProperty({ example: 1 })
  groupId!: number;

  @ApiProperty({ enum: Visibility, example: Visibility.PRIVATE })
  visibility!: Visibility;

  @ApiProperty({ example: '언어' })
  category!: string;

  @ApiPropertyOptional({ example: '#영어#단어' })
  hashtag?: string | null;

  @ApiProperty({ example: 1001 })
  imageRefId!: number;

  @ApiPropertyOptional({ example: 10 })
  cardCount?: number;
}
