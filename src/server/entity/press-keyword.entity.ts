import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PressCategory } from './press-category.entity';

@Entity('keywords')
export class PressKeyword {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  word!: string;

  @ManyToOne(() => PressCategory, (category: PressCategory) => category.keywords)
  category!: PressCategory;

  @Column({ type: 'enum', enum: ['high', 'medium', 'low'] })
  importance!: 'high' | 'medium' | 'low';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}
