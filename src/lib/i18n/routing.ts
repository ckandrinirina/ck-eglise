// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "mg"], // Replace with your supported locales
  defaultLocale: "fr", // Set your default locale
  pathnames: {
    "/": "/",
    "/auth/login": "/auth/login",
    // Add other routes as needed
  },
});
