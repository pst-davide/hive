import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
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

  @Column({ type: 'varchar', length: 80, nullable: true })
  street!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  province!: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  zip!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}
