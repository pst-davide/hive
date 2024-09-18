import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {PressKeyword} from './press-keyword.entity';

@Entity('categories')
export class PressCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({type: 'varchar', length: 7})
  color!: string;

  @OneToMany(() => PressKeyword, (keyword: PressKeyword) => keyword.category)
  keywords!: PressKeyword[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}
