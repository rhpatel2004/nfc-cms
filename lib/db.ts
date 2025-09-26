import { Sequelize } from 'sequelize';
import { sequelize } from './sequelize'; 
import { User } from './models/User';
import { Page } from './models/Page';
import { NfcTag } from './models/NfcTag';

const db = {
  sequelize,
  Sequelize,
  User,
  Page,
  NfcTag,
};

export async function initializeDatabase() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync(); 
    console.log('Database connection and sync successful!');
  } catch (error) {
    console.error('Unable to connect or sync the database:', error);
  }
}


export default db;