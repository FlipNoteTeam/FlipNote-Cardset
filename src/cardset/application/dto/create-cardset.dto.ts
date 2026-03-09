import { Visibility } from '../../domain/model/visibility';

export class CreateCardsetDto {
  name!: string;
  groupId!: number;
  visibility!: Visibility;
  category!: string;
  hashtag?: string | null;
  imageRefId!: number;
  cardCount?: number;
}
