// lib/models/NfcTag.ts (FIXED VERSION)

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize'; 
import { Page } from './Page';

// ----------------------
// 💡 FIX 1: Make nullable attributes explicitly nullable in the interface.
// ----------------------
export interface NfcTagAttributes {
    id: number;
    name: string;
    tagId: string | null;  // <-- FIXED: tagId can be null before registration
    pageId: number | null; // <-- FIXED: pageId can be null before assignment
}

// ----------------------
// 💡 FIX 2: Explicitly define the properties on the class body.
// This often resolves the TypeScript/Sequelize conflict where properties are "missing."
// ----------------------
export class NfcTag extends Model<NfcTagAttributes, any> implements NfcTagAttributes { 
    public id!: number;
    public name!: string;
    public tagId!: string | null;  // <-- FIXED
    public pageId!: number | null; // <-- FIXED
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
            // 💡 FIX 3: It must be allowNull: true initially since you register the tag later.
            allowNull: true, 
            unique: true, 
        },
        pageId: {
            type: DataTypes.INTEGER,
            allowNull: true, // This was correct, but now matches the interface.
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