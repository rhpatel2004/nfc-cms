import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface for model attributes
export interface ContentPageAttributes {
  id: number;
  title: string;
  imageUrl?: string | null;
  contentJson: object;
  isPublished: boolean;
  authorId: number;
}

// Interface for model creation attributes
interface ContentPageCreationAttributes extends Optional<ContentPageAttributes, 'id' | 'isPublished'> {}

// --- THE MODEL CLASS DEFINITION ---
class ContentPage extends Model<ContentPageAttributes, ContentPageCreationAttributes> implements ContentPageAttributes {
  public id!: number;
  public title!: string;
  public imageUrl!: string | null;
  public contentJson!: object;
  public isPublished!: boolean;
  public authorId!: number;

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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contentJson: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // This should match the table name of the User model
          key: 'id',
        },
      },
    }, {
      sequelize,
      tableName: 'ContentPages',
    });
  }
}

export default ContentPage;

