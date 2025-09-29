import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface for model attributes
export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password?: string;
}

// Interface for model creation attributes (some fields are optional)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// --- THE MODEL CLASS DEFINITION ---
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  // Timestamps
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
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      sequelize,
      tableName: 'Users', // Explicitly define table name
    });
  }
}

export default User;

