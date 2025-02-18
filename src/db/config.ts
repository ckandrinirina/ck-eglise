import { Dialect } from 'sequelize';

type DbConfig = {
  dialect: Dialect;
  storage: string;
  logging: boolean;
};

type Config = {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
};

const config: Config = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: true,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  },
};

export default config;