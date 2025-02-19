export type Messages = {
  navigation: {
    home: string;
    dashboard: string;
    login: string;
    logout: string;
  };
  language: {
    en: string;
    fr: string;
    mg: string;
  };
  home: {
    welcome: string;
    description: string;
  };
};

declare module "next-intl/messages" {
  type IntlMessages = Messages;
}
