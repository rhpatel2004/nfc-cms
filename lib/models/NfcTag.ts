// lib/models/NfcTag.ts (CLEANED)

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize'; 
import { Page } from './Page';

// ----------------------
// 💡 FIX: Remove unused 'Optional' import
// ----------------------

// Define the required attributes (TAttributes)
export interface NfcTagAttributes {
    id: number;
    name: string;
    tagId: string | null;
    pageId: number | null; 
}

// Define the creation attributes (TCreationAttributes)
// For auto-incrementing fields like 'id', we need to make them optional on creation.
// We'll also make tagId and pageId optional since they are set *after* the record is created.
export type NfcTagCreationAttributes = {
    id?: number; // Primary key is optional on creation
    name: string;
    tagId?: string | null;
    pageId?: number | null;
};

// ----------------------
// 💡 FIX 1: Replace 'any' with the specific creation type
// ----------------------
export class NfcTag extends Model<NfcTagAttributes, NfcTagCreationAttributes> implements NfcTagAttributes { 
    // These properties are required for TypeScript strict mode
    public id!: number;
    public name!: string;
    public tagId!: string | null;
    public pageId!: number | null; 
}

NfcTag.init(
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
        tagId: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true, 
        },
        pageId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Page,
                key: 'id',
            }
        },
    },
    {
        sequelize,
        modelName: 'NfcTag',
        tableName: 'NfcTags',
        timestamps: true,
    }
);

// Define the association
NfcTag.belongsTo(Page, { foreignKey: 'pageId', as: 'assignedPage' });
Page.hasMany(NfcTag, { foreignKey: 'pageId' });

export default NfcTag;