import { Model, DataTypes, Sequelize } from 'sequelize';

export class Press extends Model {
  public id!: number;
  public newspaper!: string;
  public url!: string | null;
  public scannedText!: string | null;
  public aiSummary!: string | null;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  static initModel(sequelize: Sequelize) {
    Press.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        newspaper: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        url: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        scannedText: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        aiSummary: {
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
        tableName: 'press',
        timestamps: true,
      }
    );
  }
}
