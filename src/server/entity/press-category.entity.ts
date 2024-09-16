import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {PressKeyword} from './press-keyword.entity';

@Entity('categories')
export class PressCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @OneToMany(() => PressKeyword, (keyword: PressKeyword) => keyword.category)
  keywords!: PressKeyword[];
}
