import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from './user.model';

export class Channel extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  static initModel(sequelize: Sequelize) {
    Channel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdBy: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        modifiedBy: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'channels',
        timestamps: true,
      }
    );

    // Relazione ManyToMany con User
    Channel.belongsToMany(User, {
      through: 'channel_owners',
      foreignKey: 'channel_id',
      otherKey: 'user_id',
      as: 'owners',
    });
  }
}
