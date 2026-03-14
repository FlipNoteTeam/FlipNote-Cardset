import { EntityManager } from 'typeorm';
import { Cardset } from '../model/cardset';

export const CARDSET_REPOSITORY = Symbol('CARDSET_REPOSITORY');

export interface ICardsetRepository {
  findAll(): Promise<Cardset[]>;
  findById(id: number): Promise<Cardset | null>;
  findByIds(ids: number[]): Promise<Cardset[]>;
  save(cardset: Cardset, manager?: EntityManager): Promise<Cardset>;
  update(id: number, cardset: Partial<Cardset>): Promise<Cardset | null>;
  delete(id: number): Promise<void>;
}
