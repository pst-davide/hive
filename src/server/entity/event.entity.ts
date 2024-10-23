import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Shift} from './shift.entity';

@Entity('events')
export class Calendar {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  id!: string;

  @Column({type: 'varchar', length: 12, unique: true})
  code!: string;

  @Column()
  serial!: number;

  @Column({type: 'varchar', length: 80})
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 6, nullable: true })
  shiftId!: string | null;

  @ManyToOne(() => Shift, { nullable: true })
  @JoinColumn({ name: 'shiftId', referencedColumnName: 'id' })
  shift!: Shift | null;

  @Column({type: 'varchar', length: 7})
  color!: string;

  @Column()
  status!: number;

  @Column({ type: 'simple-array', nullable: true })
  resourceIds!: string[];

  @Column({ type: 'varchar', nullable: true })
  customerId!: string | null;

  @Column({ type: 'boolean', default: false })
  allDay!: boolean;

  @Column({ type: 'date', nullable: true })
  eventDate!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate!: Date | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}
