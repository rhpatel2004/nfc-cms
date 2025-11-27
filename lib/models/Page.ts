// lib/models/Page.ts

import { DataTypes, Model } from 'sequelize'; // 💡 FIX 1: Removed unused 'Optional'
import { sequelize } from '../sequelize'; 
// 💡 FIX 2: Removed unused import 'db'

// Define the required attributes (TAttributes)
export interface PageAttributes {
    id: number;
    name: string;
    slug: string;
    content: string;
}

// Define the creation attributes (TCreationAttributes)
// 'id' is optional because it's auto-incrementing.
type PageCreationAttributes = {
    id?: number; 
    name: string;
    slug: string;
    content: string;
};

// 💡 FIX 3: Replaced 'any' with the specific creation type
export class Page extends Model<PageAttributes, PageCreationAttributes> implements PageAttributes { 
    // Properties must be explicitly defined for TypeScript strict mode
    public id!: number;
    public name!: string;
    public slug!: string;
    public content!: string;
}

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