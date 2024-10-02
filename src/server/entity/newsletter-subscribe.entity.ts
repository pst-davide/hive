import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {User} from './user.entity';
import {Channel} from './newsletter-channel.entity';

@Entity('subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  userId!: number; // Colonna per l'ID dell'utente

  @Column()
  channelId!: number; // Colonna per l'ID del canale

  // Relazione ManyToOne con l'entità User
  @ManyToOne(() => User, user => user.id)
  user!: User;

  // Relazione ManyToOne con l'entità Channel
  @ManyToOne(() => Channel, channel => channel.id)
  channel!: Channel;
}
