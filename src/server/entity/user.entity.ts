import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  id!: string;

  @Column({type: 'varchar', length: 30})
  name!: string;

  @Column({type: 'varchar', length: 30})
  lastname!: string;

  @Column({type: 'varchar', length: 40, unique: true})
  email!: string;

  @Column({type: 'varchar', length: 80})
  password!: string;

  @Column({type: 'int'})
  role!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  createdBy!: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  modifiedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  modifiedBy!: string | null;

  @Column({ type: 'varchar', nullable: true })
  refreshToken!: string | null;

  @Column({ type: 'varchar', nullable: true })
  currentToken!: string | null;

  @Column()
  enabled!: boolean;
}
