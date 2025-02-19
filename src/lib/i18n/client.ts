"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { i18nConfig } from "./config";
import LanguageDetector from "i18next-browser-languagedetector";

// Pre-load all translations to avoid loading issues
const resources = {
  en: {
    common: {
      language: {
        en: "English",
        fr: "French",
        mg: "Malagasy",
      },
      navigation: {
        home: "Home",
        dashboard: "Dashboard",
        login: "Login",
        logout: "Logout",
      },
      home: {
        welcome: "Welcome",
        description: "Church Management Application",
      },
    },
  },
  fr: {
    common: {
      language: {
        en: "Anglais",
        fr: "Français",
        mg: "Malgache",
      },
      navigation: {
        home: "Accueil",
        dashboard: "Tableau de bord",
        login: "Connexion",
        logout: "Déconnexion",
      },
      home: {
        welcome: "Bienvenue",
        description: "Application de gestion d'église",
      },
    },
  },
  mg: {
    common: {
      language: {
        en: "Anglisy",
        fr: "Frantsay",
        mg: "Malagasy",
      },
      navigation: {
        home: "Fandraisana",
        dashboard: "Takelaka Fampisehoana",
        login: "Hiditra",
        logout: "Hivoaka",
      },
      home: {
        welcome: "Tongasoa",
        description: "Rindran-draharaha fitantanana fiangonana",
      },
    },
  },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: i18nConfig.defaultLocale,
    fallbackLng: i18nConfig.defaultLocale,
    defaultNS: "common",
    ns: ["common"],
    detection: {
      order: ["path", "cookie", "navigator"],
      lookupFromPathIndex: 0,
      caches: ["cookie"],
      cookieName: "NEXT_LOCALE",
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18next;
