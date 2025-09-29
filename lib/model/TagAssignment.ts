import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface for the model's attributes
export interface TagAssignmentAttributes {
  id: number;
  pageId: number;
  tagId: number;
}

// Interface for the model's creation attributes
interface TagAssignmentCreationAttributes extends Optional<TagAssignmentAttributes, 'id'> {}

// --- THE MODEL CLASS DEFINITION ---
class TagAssignment extends Model<TagAssignmentAttributes, TagAssignmentCreationAttributes> implements TagAssignmentAttributes {
  public id!: number;
  public pageId!: number;
  public tagId!: number;

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
      pageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'ContentPages', key: 'id' },
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'NfcTags', key: 'id' },
      },
    }, {
      sequelize,
      tableName: 'TagAssignments',
    });
  }
}

export default TagAssignment;

