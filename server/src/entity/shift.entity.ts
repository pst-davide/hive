import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity('shifts')
export class Shift {
  @PrimaryColumn({ type: 'varchar', length: 6 })
  id!: string;

  @Column({type: 'varchar', length: 6, unique: true})
  code!: string;

  @Column({type: 'varchar', length: 80})
  name!: string;

  @Column({type: 'varchar', length: 7})
  color!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}
