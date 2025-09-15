// lib/db.ts
import { Sequelize, DataTypes, Model } from 'sequelize';
import dotenv from 'dotenv';
import mysql2 from 'mysql2';

dotenv.config();

// Define the database connection first
const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    dialect: 'mysql',
    dialectModule: mysql2,
  }
);

// Export the UserAttributes interface so it can be used in other files
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

// Define the User model after the Sequelize connection is established
// Use the UserAttributes interface to tell TypeScript the model's structure
class User extends Model<UserAttributes, any> {}

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

interface DbType {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: typeof User;
}

const db: DbType = {} as DbType;

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = User;

sequelize.sync();

export default db;