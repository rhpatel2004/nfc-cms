import { Sequelize } from 'sequelize';
import User from './user';
import ContentPage from './ContentPage';
import NfcTag from './NfcTags';
import Analytics from './Analytics';
import TagAssignment from './TagAssignment';

// This function will be called by db.ts AFTER the models have been defined.
// It receives the sequelize instance which holds all the defined models.
export function applyAssociations(sequelize: Sequelize) {
    // Get the models from the sequelize instance
    const { User, ContentPage, NfcTag, Analytics, TagAssignment } = sequelize.models;

    // --- Define All Model Relationships ---

    // A User can have many ContentPages
    User.hasMany(ContentPage, { foreignKey: 'authorId', as: 'pages' });
    ContentPage.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

    // A ContentPage can be assigned to many NfcTags through the TagAssignment table
    ContentPage.belongsToMany(NfcTag, {
        through: TagAssignment,
        foreignKey: 'pageId',
        as: 'tags'
    });

    // An NfcTag can be assigned many ContentPages through the TagAssignment table
    NfcTag.belongsToMany(ContentPage, {
        through: TagAssignment,
        foreignKey: 'tagId',
        as: 'pages'
    });

    // An NfcTag can have many Analytics taps
    NfcTag.hasMany(Analytics, { foreignKey: 'tagId', as: 'taps' });
    Analytics.belongsTo(NfcTag, { foreignKey: 'tagId', as: 'tag' });

    console.log('✅ Model associations have been applied.');
}

// Export the raw model files for type referencing if needed elsewhere
export { User, ContentPage, NfcTag, Analytics, TagAssignment };

