"use client";

import { memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

// Group UI component imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Service and type imports
import { DropdownService } from "@/lib/services/dropdown.service";
import { cn } from "@/lib/utils";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { Territory } from "@/types/users/user";

/**
 * DropdownSelect component for single value selection from predefined dropdown lists
 *
 * @component
 * @example
 * // Single selection
 * <DropdownSelect dropdownKey="territory" onChange={handleChange} />
 *
 * // With React Hook Form
 * <FormField
 *   control={form.control}
 *   name="territoryId"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Territory</FormLabel>
 *       <FormControl>
 *         <DropdownSelect
 *           dropdownKey="territory"
 *           value={field.value}
 *           onChange={field.onChange}
 *           onBlur={field.onBlur}
 *           name={field.name}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 */

export type DropdownSelectProps = {
  /**
   * The key of the parent dropdown to fetch items for
   */
  dropdownKey: string;

  /**
   * The currently selected value
   */
  value?: string | null | undefined;

  /**
   * Callback triggered when selection changes
   */
  onChange?: (value: string) => void;

  /**
   * Placeholder text when no selection is made
   */
  placeholder?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Label for the dropdown
   */
  label?: string;

  /**
   * Description text below the dropdown
   */
  description?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Disable the dropdown
   */
  disabled?: boolean;

  /**
   * Include disabled dropdown items in options
   */
  includeDisabled?: boolean;

  /**
   * Mark the field as required
   */
  required?: boolean;

  /**
   * Name attribute for the input (for forms)
   */
  name?: string;

  /**
   * Callback triggered on field blur
   */
  onBlur?: () => void;
};

export const DropdownSelect = memo(
  ({
    dropdownKey,
    value,
    onChange,
    placeholder,
    className,
    label,
    description,
    error,
    disabled = false,
    includeDisabled = false,
    required = false,
    name,
    onBlur,
  }: DropdownSelectProps) => {
    const t = useTranslations();
    const { getLocalizedName } = useLocalizedName();

    // Convert value to string for single select, handling null/undefined cases
    const singleValue = typeof value === "string" ? value : "";

    // Fetch dropdown options by key
    const { data: dropdownItems = [], isLoading } = useQuery({
      queryKey: ["dropdowns", "byKey", dropdownKey, includeDisabled],
      queryFn: async () => {
        try {
          // First get the parent dropdown with this key
          const response = await DropdownService.getDropdowns({
            isParent: true,
            includeDisabled,
          });

          const parent = response.data.find((item) => item.key === dropdownKey);

          if (!parent) {
            console.error(`No parent dropdown found with key: ${dropdownKey}`);
            return [];
          }

          // Then get all children for this parent
          const childrenResponse = await DropdownService.getChildDropdowns(
            parent.id,
            includeDisabled,
          );

          return childrenResponse.data;
        } catch (err) {
          console.error("Error fetching dropdown items:", err);
          return [];
        }
      },
      enabled: !!dropdownKey,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Handle selection change
    const handleValueChange = useCallback(
      (selectedValue: string) => {
        onChange?.(selectedValue);
      },
      [onChange],
    );

    return (
      <div className="space-y-2">
        {label && (
          <div className="flex items-baseline justify-between">
            <Label
              htmlFor={name}
              className={cn(
                required &&
                  "after:content-['*'] after:text-destructive after:ml-0.5",
                error && "text-destructive",
              )}
            >
              {label}
            </Label>
          </div>
        )}

        <Select
          value={singleValue}
          onValueChange={handleValueChange}
          disabled={disabled || isLoading}
          name={name}
          onOpenChange={(open) => {
            if (!open && onBlur) {
              onBlur();
            }
          }}
        >
          <SelectTrigger
            className={cn("w-full", error && "border-destructive", className)}
          >
            <SelectValue placeholder={placeholder || t("dropdown.select")} />
          </SelectTrigger>
          <SelectContent>
            {!Array.isArray(dropdownItems) || dropdownItems.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                {isLoading ? t("dropdown.loading") : t("dropdown.noOptions")}
              </p>
            ) : (
              dropdownItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {getLocalizedName(item as Territory).name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  },
);

DropdownSelect.displayName = "DropdownSelect";
