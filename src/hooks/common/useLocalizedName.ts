/**
 * @file Custom hook for localizing content based on current locale
 * @description Centralizes the usage of the getLocalizedName utility
 * @module i18n
 */

import { useParams } from "next/navigation";
import { getLocalizedName as getLocalizedNameUtil } from "@/lib/utils";
import { useCallback } from "react";
import { DropdownUser } from "@/types/users/user";

/**
 * Interface for items that can be localized
 */

/**
 * Hook that provides localization functionality based on the current locale
 *
 * @hook
 * @returns An object containing the current locale and a function to get localized names
 *
 * @example
 * // Basic usage
 * const { locale, getLocalizedName } = useLocalizedName();
 * const { name, isFallback } = getLocalizedName(item);
 */
export const useLocalizedName = () => {
  const { locale } = useParams();

  /**
   * Gets the localized name for an item based on the current locale
   *
   * @param {LocalizedItem} item - The item with localized name properties
   * @returns Object containing the localized name and whether a fallback was used
   */
  const getLocalizedName = useCallback(
    (item: DropdownUser | null | undefined) => {
      if (!item) return { name: "-", isFallback: false };
      return getLocalizedNameUtil(item, locale as string);
    },
    [locale],
  );

  return { locale, getLocalizedName };
};
