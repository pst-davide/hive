import { Model, DataTypes, Sequelize } from 'sequelize';
import {Shift} from './shift.model';

export class Calendar extends Model {
  public id!: string;
  public code!: string;
  public serial!: number;
  public year!: number;
  public title!: string;
  public description!: string | null;
  public shiftId!: string | null;
  public color!: string;
  public status!: number;
  public resourceIds!: string[];
  public customerId!: string | null;
  public allDay!: boolean;
  public eventDate!: string | null;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public createdBy!: string | null;
  public modifiedBy!: string | null;

  // Relazione Many-to-One con Shift
  public shift!: Shift | null;

  static initModel(sequelize: Sequelize) {
    Calendar.init(
      {
        id: {
          type: DataTypes.STRING(12),
          primaryKey: true,
        },
        code: {
          type: DataTypes.STRING(12),
          unique: true,
        },
        serial: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        year: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        shiftId: {
          type: DataTypes.STRING(6),
          allowNull: true,
        },
        color: {
          type: DataTypes.STRING(7),
          allowNull: false,
        },
        status: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        resourceIds: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
        customerId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        allDay: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        eventDate: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        endDate: {
          type: DataTypes.DATE,
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
        tableName: 'events',
        timestamps: true,
      }
    );

    Calendar.belongsTo(Shift, {
      foreignKey: 'shiftId', // Chiave esterna
      targetKey: 'id', // Chiave primaria nel modello Shift
    });
  }
}
