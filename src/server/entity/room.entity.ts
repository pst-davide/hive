import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  code!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  capacity!: number;

  @Column('simple-array')
  owners!: string[];

  @Column({ nullable: true })
  floor!: number;

  @Column()
  enabled!: boolean;

  @Column({ nullable: true })
  street!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  province!: string;

  @Column({ length: 5, nullable: true })
  zip!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ nullable: true })
  createdBy!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ nullable: true })
  modifiedBy!: string;
}
