import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cardset } from '../../cardset/entities/cardset.entity';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('cards')
export class Card extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  order: number;

  @Column()
  cardsetId: number;

  @ManyToOne(() => Cardset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cardsetId' })
  cardset: Cardset;
}