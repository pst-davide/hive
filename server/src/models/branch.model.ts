import { Model, DataTypes, Sequelize } from 'sequelize';
import { Room } from './room.model';

export class Branch extends Model {
  public id!: string;
  public code!: string;
  public name!: string;
  public phone!: string;
  public email!: string;
  public color!: string;
  public description!: string | null;
  public enabled!: boolean;
  public street!: string | null;
  public city!: string | null;
  public province!: string | null;
  public zip!: string | null;
  public latitude!: number;
  public longitude!: number;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  static initModel(sequelize: Sequelize) {
    Branch.init(
      {
        id: {
          type: DataTypes.STRING(6),
          primaryKey: true,
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(6),
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(40),
          allowNull: false,
        },
        color: {
          type: DataTypes.STRING(7),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        street: {
          type: DataTypes.STRING(80),
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING(80),
          allowNull: true,
        },
        province: {
          type: DataTypes.STRING(80),
          allowNull: true,
        },
        zip: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        latitude: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: false,
        },
        longitude: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: false,
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
        tableName: 'branches',
        timestamps: true,
      }
    );

    // Relazione con il modello Room
    Branch.hasMany(Room, { foreignKey: 'branchId', as: 'rooms' });
  }
}
