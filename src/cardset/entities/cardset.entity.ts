import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('card_set')
export class Cardset {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name!: string;

  @Column({ name: 'group_id', type: 'int', nullable: false })
  groupId!: number;

  @Column({
    name: 'is_public',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  publicVisible!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: false })
  category!: string;

  @Column({ type: 'varchar', nullable: true })
  hashtag?: string | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: false })
  imageUrl!: string;
}
