import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LocalizedItem {
  name: string;
  nameFr?: string | null;
  nameMg?: string | null;
}

export const getLocalizedName = (
  item: LocalizedItem,
  locale: string,
): { name: string; isFallback: boolean } => {
  let name: string;
  let isFallback = false;

  switch (locale) {
    case "fr":
      if (item.nameFr) {
        name = item.nameFr;
      } else {
        name = item.name;
        isFallback = true;
      }
      break;
    case "mg":
      if (item.nameMg) {
        name = item.nameMg;
      } else {
        name = item.name;
        isFallback = true;
      }
      break;
    default:
      name = item.name;
  }

  return { name, isFallback };
};
