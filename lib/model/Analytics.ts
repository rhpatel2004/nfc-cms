import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface for the model's attributes
export interface AnalyticsAttributes {
  id: number;
  tapTimestamp: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  country?: string | null;
  tagId: number;
}

// Interface for the model's creation attributes
interface AnalyticsCreationAttributes extends Optional<AnalyticsAttributes, 'id' | 'tapTimestamp'> {}

// --- THE MODEL CLASS DEFINITION ---
class Analytics extends Model<AnalyticsAttributes, AnalyticsCreationAttributes> implements AnalyticsAttributes {
  public id!: number;
  public tapTimestamp!: Date;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public country!: string | null;
  public tagId!: number;

  // Timestamps (createdAt and updatedAt are automatically managed)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // This static method will be called by db.ts to initialize the model
  public static initialize(sequelize: Sequelize) {
    this.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tapTimestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'NfcTags', // This should match the table name of the NfcTag model
          key: 'id',
        },
      },
    }, {
      sequelize,
      tableName: 'Analytics',
    });
  }
}

export default Analytics;

