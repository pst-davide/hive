import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('press')
@Entity()
export class Press {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  newspaper!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url!: string;

  @Column({ type: 'text', nullable: true })
  scannedText!: string;

  @Column({ type: 'text', nullable: true })
  aiSummary!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;
}
