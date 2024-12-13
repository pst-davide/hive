import { Model, DataTypes, Sequelize } from 'sequelize';

export class Shift extends Model {
  public id!: string;
  public code!: string;
  public name!: string;
  public color!: string;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  static initModel(sequelize: Sequelize) {
    Shift.init(
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
        color: {
          type: DataTypes.STRING(7),
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
        tableName: 'shifts',
        timestamps: true,
      }
    );
  }
}
