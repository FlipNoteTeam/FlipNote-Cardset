export class CreateCardsetDto {
  name!: string;
  groupId!: number;
  publicVisible!: boolean;
  category!: string;
  hashtag?: string | null;
  imageUrl!: string;
  cardCount?: number;
}
