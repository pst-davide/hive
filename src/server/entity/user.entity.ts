import {Entity, PrimaryColumn} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  id!: string;
}
