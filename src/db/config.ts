type DbConfig = {
  logging: boolean;
};

type Config = {
  development: DbConfig;
  test: DbConfig;
  production: DbConfig;
};

const config: Config = {
  development: {
    logging: true,
  },
  test: {
    logging: false,
  },
  production: {
    logging: false,
  },
};

export default config;
