import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {User} from './user.entity';
import {Channel} from './newsletter-channel.entity';

@Entity('subscribers')
@Unique(['userId', 'channelId'])
export class Subscriber {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  userId!: string; // Colonna per l'ID dell'utente

  @Column()
  channelId!: number; // Colonna per l'ID del canale

  // Relazione ManyToOne con l'entità User
  @ManyToOne(() => User, user => user.id)
  user!: User;

  // Relazione ManyToOne con l'entità Channel
  @ManyToOne(() => Channel, channel => channel.id)
  channel!: Channel;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  subscriptionDate!: Date;
}
