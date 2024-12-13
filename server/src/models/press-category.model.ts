import { Model, DataTypes, Sequelize } from 'sequelize';
import { PressKeyword } from './press-keyword.model';

export class PressCategory extends Model {
  public id!: number;
  public name!: string;
  public color!: string;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  static initModel(sequelize: Sequelize) {
    PressCategory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
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
        tableName: 'categories',
        timestamps: true,
      }
    );

    // Relazione OneToMany con PressKeyword
    PressCategory.hasMany(PressKeyword, {
      foreignKey: 'categoryId',
      as: 'keywords',
    });
  }
}
