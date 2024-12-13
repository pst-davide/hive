import { Model, DataTypes, Sequelize } from 'sequelize';

export class User extends Model {
  public id!: string;
  public name!: string;
  public lastname!: string;
  public email!: string;
  public password!: string;
  public role!: number;
  public birthDate!: string | null;
  public birthCity!: string | null;
  public birthProvince!: string | null;
  public cf!: string | null;
  public phone!: string | null;
  public createdBy!: string | null;
  public modifiedBy!: string | null;
  public refreshToken!: string | null;
  public currentToken!: string | null;
  public enabled!: boolean;

  static initModel(sequelize: Sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.STRING(50),
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        lastname: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        birthDate: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        birthCity: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        birthProvince: {
          type: DataTypes.STRING(2),
          allowNull: true,
        },
        cf: {
          type: DataTypes.STRING(16),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(20),
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
        refreshToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        currentToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'users',
        timestamps: true,
      }
    );
  }
}
