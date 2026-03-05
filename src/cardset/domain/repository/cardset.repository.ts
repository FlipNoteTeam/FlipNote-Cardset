import { Cardset } from '../model/cardset';

export const CARDSET_REPOSITORY = Symbol('CARDSET_REPOSITORY');

export interface ICardsetRepository {
  findAll(): Promise<Cardset[]>;
  findById(id: number): Promise<Cardset | null>;
  save(cardset: Cardset): Promise<Cardset>;
  update(id: number, cardset: Partial<Cardset>): Promise<Cardset | null>;
  delete(id: number): Promise<void>;
}
