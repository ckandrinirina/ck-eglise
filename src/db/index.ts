import { Sequelize } from 'sequelize';
import config from './config';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

export const sequelize = new Sequelize({
  ...dbConfig,
});

export const initializeDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default sequelize;