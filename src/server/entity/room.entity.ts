import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Branch} from './branch.entity';

@Entity('rooms')
export class Room {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  id!: string;

  @Column({type: 'varchar', length: 6, unique: true})
  code!: string;

  @Column({type: 'varchar', length: 80})
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ nullable: true })
  capacity!: number;

  @Column('simple-array')
  owners!: string[];

  @Column({ nullable: true })
  floor!: number;

  @Column()
  enabled!: boolean;

  @Column({type: 'varchar', length: 7})
  color!: string;

  @Column({ type: 'varchar' })
  branchId!: string;

  @ManyToOne(() => Branch, (location: Branch) => location.rooms, { nullable: false })
  @JoinColumn({ name: 'branchId', referencedColumnName: 'id' })
  branch!: Branch;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}

