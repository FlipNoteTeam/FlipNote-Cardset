import { Cardset } from '../../cardset/entities/cardset.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('card')
export class Card {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ name: 'card_set_id', type: 'int', nullable: false })
  cardSetId!: number;

  @ManyToOne(() => Cardset, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'card_set_id' })
  cardset?: Cardset;

  @Column({ type: 'text', nullable: false })
  content!: string;
}