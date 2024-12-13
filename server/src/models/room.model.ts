import { Model, DataTypes, Sequelize } from 'sequelize';
import { Branch } from './branch.model';

export class Room extends Model {
  public id!: string;
  public code!: string;
  public name!: string;
  public description!: string | null;
  public capacity!: number | null;
  public owners!: string[];
  public floor!: number | null;
  public enabled!: boolean;
  public color!: string;
  public branchId!: string;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  public branch!: Branch;

  static initModel(sequelize: Sequelize) {
    Room.init(
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
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        capacity: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        owners: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
        floor: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        color: {
          type: DataTypes.STRING(7),
          allowNull: false,
        },
        branchId: {
          type: DataTypes.STRING,
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
        tableName: 'rooms',
        timestamps: true,
      }
    );

    // Relazione con il modello Branch
    Room.belongsTo(Branch, { foreignKey: 'branchId', targetKey: 'id' });

  }
}
