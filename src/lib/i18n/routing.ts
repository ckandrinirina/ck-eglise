// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"], // Replace with your supported locales
  pathnames: {
    "/": "/",
    "/auth/login": "/auth/login",
    // Add other routes as needed
  },
});
