// lib/models/PageTaps.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';
import { Page } from './Page'; // Import Page model for foreign key
import { NfcTag } from './NfcTag'; // Import NfcTag model for foreign key

export interface PageTapAttributes {
  id: number;
  tagId: number;
  pageId: number;
  ipAddress: string;
  timestamp: Date;
}

export class PageTaps extends Model<PageTapAttributes> {}

PageTaps.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: NfcTag,
        key: 'id',
      },
    },
    pageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Page,
        key: 'id',
      },
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null if IP is hard to get
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PageTaps',
    tableName: 'PageTaps',
    timestamps: false, // We use the explicit timestamp column
  }
);

// Define associations (needed for JOINs in the API)
PageTaps.belongsTo(Page, { foreignKey: 'pageId', as: 'page' });

export default PageTaps;