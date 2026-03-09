import { Visibility } from '../../domain/model/visibility';

export class UpdateCardsetDto {
  name?: string;
  visibility?: Visibility;
  category?: string;
  hashtag?: string | null;
}
