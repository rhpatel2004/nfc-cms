import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';

// 1. Import the MODEL CLASSES directly from their files
import User from './model/user';
import ContentPage from './model/ContentPage';
import NfcTag from './model/NfcTags';
import TagAssignment from './model/TagAssignment';
import Analytics from './model/Analytics';

let sequelizeInstance: Sequelize | null = null;

const connectAndSyncDb = async () => {
    if (sequelizeInstance) {
        return sequelizeInstance;
    }

    const dbName = process.env.DB_NAME!;
    const dbUser = process.env.DB_USER!;
    const dbPass = process.env.DB_PASSWORD;
    const dbHost = process.env.DB_HOST!;

    const sequelize = new Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        dialect: 'mysql',
        dialectModule: mysql2, // The definitive fix for the bundler issue
        logging: false,
    });

    // --- 2. INITIALIZE ALL MODELS ---
    // This calls the static .initialize() method on each model class.
    // This replaces the old "defineUser(sequelize)" calls.
    User.initialize(sequelize);
    ContentPage.initialize(sequelize);
    NfcTag.initialize(sequelize);
    TagAssignment.initialize(sequelize);
    Analytics.initialize(sequelize);

    // --- 3. APPLY ASSOCIATIONS ---
    // Now that the models are proper classes, TypeScript understands .hasMany(), etc.
    User.hasMany(ContentPage, { foreignKey: 'authorId', as: 'pages' });
    ContentPage.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

    ContentPage.belongsToMany(NfcTag, { through: TagAssignment, foreignKey: 'pageId', as: 'tags' });
    NfcTag.belongsToMany(ContentPage, { through: TagAssignment, foreignKey: 'tagId', as: 'pages' });

    NfcTag.hasMany(Analytics, { foreignKey: 'tagId', as: 'taps' });
    Analytics.belongsTo(NfcTag, { foreignKey: 'tagId', as: 'tag' });
    console.log('✅ Model associations have been applied.');
    
    // --- 4. SYNC DATABASE ---
    await sequelize.sync({ alter: true });
    
    sequelizeInstance = sequelize;
    return sequelizeInstance;
};

export default connectAndSyncDb;

