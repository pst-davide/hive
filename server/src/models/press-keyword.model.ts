import { Model, DataTypes, Sequelize } from 'sequelize';
import { PressCategory } from './press-category.model';

export class PressKeyword extends Model {
  public id!: number;
  public word!: string;
  public categoryId!: number;
  public importance!: 'high' | 'medium' | 'low';
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  static initModel(sequelize: Sequelize) {
    PressKeyword.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        word: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        categoryId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        importance: {
          type: DataTypes.ENUM('high', 'medium', 'low'),
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
        tableName: 'keywords',
        timestamps: true,
      }
    );

    // Relazione ManyToOne con PressCategory
    PressKeyword.belongsTo(PressCategory, {
      foreignKey: 'categoryId',
      as: 'category',
    });
  }
}
