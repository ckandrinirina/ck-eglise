declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    NODE_ENV: "development" | "production" | "test";
    DEFAULT_LOCALE: string;
    SUPPORTED_LOCALES: string;
  }
}
