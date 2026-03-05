import { Card } from '../model/card';

export const CARD_REPOSITORY = Symbol('CARD_REPOSITORY');

export interface ICardRepository {
  findById(id: number): Promise<Card | null>;
  findAllByCardsetId(cardsetId: number): Promise<Card[]>;
  save(card: Card): Promise<Card>;
  update(id: number, card: Partial<Card>): Promise<Card | null>;
  delete(id: number): Promise<void>;
  updateOrder(cardId: number, order: number): Promise<void>;
}
