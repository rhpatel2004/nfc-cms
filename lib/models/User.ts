// lib/models/User.ts

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../sequelize';

// Define the required attributes (TAttributes)
export interface UserAttributes {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
}

// Define the creation attributes (TCreationAttributes)
// 'id' is optional for creation since it's auto-incrementing.
export type UserCreationAttributes = {
    id?: number; 
    name: string;
    email: string;
    passwordHash: string;
};


// 💡 FIX 1: Replace 'any' with the specific creation type
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    // 💡 FIX 2: Explicitly define properties for TypeScript strict mode
    public id!: number;
    public name!: string;
    public email!: string;
    public passwordHash!: string;
}

User.init(
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true,
    }
);

export default User;

