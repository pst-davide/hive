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
}
