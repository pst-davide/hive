import { Model, DataTypes, Sequelize } from 'sequelize';
import {Channel} from './channel.model';
import {User} from './user.model';

export class Subscriber extends Model {
  public id!: number;
  public userId!: string;
  public channelId!: number;
  public subscriptionDate!: Date;

  // Relazioni
  public user!: User;
  public channel!: Channel;

  static initModel(sequelize: Sequelize) {
    Subscriber.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        channelId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        subscriptionDate: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW, // Gestisce automaticamente il valore corrente
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'subscribers',
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: ['userId', 'channelId'], // Unicità combinata di userId e channelId
          },
        ],
      }
    );

    Subscriber.belongsTo(User, {
      foreignKey: 'userId', // Chiave esterna
      targetKey: 'id', // Chiave primaria nel modello User
    });

    Subscriber.belongsTo(Channel, {
      foreignKey: 'channelId', // Chiave esterna
      targetKey: 'id', // Chiave primaria nel modello Channel
    });
  }
}
