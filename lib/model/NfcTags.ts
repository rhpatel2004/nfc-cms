import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Interface for the model's attributes
export interface NfcTagAttributes {
  id: number;
  tagUid: string;
  tagName: string;
  status: 'active' | 'inactive' | 'unassigned';
}

// Interface for the model's creation attributes
interface NfcTagCreationAttributes extends Optional<NfcTagAttributes, 'id' | 'status'> {}

// --- THE MODEL CLASS DEFINITION ---
class NfcTag extends Model<NfcTagAttributes, NfcTagCreationAttributes> implements NfcTagAttributes {
  public id!: number;
  public tagUid!: string;
  public tagName!: string;
  public status!: 'active' | 'inactive' | 'unassigned';

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
      tagUid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tagName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'unassigned'),
        allowNull: false,
        defaultValue: 'unassigned',
      },
    }, {
      sequelize,
      tableName: 'NfcTags',
    });
  }
}

export default NfcTag;

