// lib/models/Page.ts
import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db';
import { sequelize } from '../sequelize'; 

export interface PageAttributes {
    id: number;
    name: string;
    slug: string;
    content: string;
}

export class Page extends Model<PageAttributes, any> { }

Page.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Page',
        tableName: 'Pages',
        timestamps: true,
    }
);

export default Page;