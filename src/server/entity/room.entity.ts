import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  code!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  capacity!: number;

  @Column('simple-array')
  owners!: string[];

  @Column()
  floor!: number;

  @Column()
  enabled!: boolean;

  @Column()
  street!: string;

  @Column()
  city!: string;

  @Column()
  province!: string;

  @Column({ length: 5 })
  zip!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column()
  createdBy!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column()
  modifiedBy!: string;
}
