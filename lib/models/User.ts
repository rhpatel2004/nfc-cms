import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize'; 

export interface UserAttributes {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
}

export class User extends Model<UserAttributes, any> { }

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