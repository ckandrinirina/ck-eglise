"use client";

import * as React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XCircle, XIcon, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

// Service and type imports
import { DropdownService } from "@/lib/services/dropdown.service";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { Territory } from "@/types/users/user";
import { Label } from "@/components/ui/label";

/**
 * Variants for the multi-select badges to handle different styles.
 */
const multiSelectBadgeVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * DropdownSelectMultiple component for selecting multiple values from predefined dropdown lists
 * Fully compatible with React Hook Form
 */
export type DropdownSelectMultipleProps = {
  /**
   * The key of the parent dropdown to fetch items for
   */
  dropdownKey: string;

  /**
   * The currently selected values
   */
  value?: string[] | null | undefined;

  /**
   * Callback triggered when selection changes
   */
  onChange?: (value: string[]) => void;

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

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   */
  maxDisplay?: number;

  /**
   * Badge variant for the selected items
   */
  badgeVariant?: VariantProps<typeof multiSelectBadgeVariants>["variant"];
};

/**
 * DropdownSelectMultiple component for selecting multiple values from predefined dropdown lists
 *
 * @component
 * @example
 * // Basic usage
 * <DropdownSelectMultiple dropdownKey="branch" onChange={handleMultiChange} />
 *
 * // With React Hook Form
 * <FormField
 *   control={form.control}
 *   name="branches"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Branches</FormLabel>
 *       <FormControl>
 *         <DropdownSelectMultiple
 *           dropdownKey="branch"
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
export const DropdownSelectMultiple = React.forwardRef<
  HTMLButtonElement,
  DropdownSelectMultipleProps
>(
  (
    {
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
      maxDisplay = 3,
      badgeVariant = "secondary",
    },
    ref,
  ) => {
    const t = useTranslations();
    const { getLocalizedName } = useLocalizedName();

    // Ensure value is always an array, even if it's null or undefined
    const safeValue = Array.isArray(value) ? value : [];

    // For multiple selections management
    const [selectedValues, setSelectedValues] = useState<string[]>(safeValue);

    // For command/popover state
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const popoverTriggerRef = useRef<HTMLButtonElement>(null);

    // Update local state when external value changes
    useEffect(() => {
      setSelectedValues(Array.isArray(value) ? value : []);
    }, [value]);

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

    // Transform dropdown items to option format
    const options = React.useMemo(() => {
      if (!Array.isArray(dropdownItems)) return [];

      return dropdownItems.map((item) => ({
        label: getLocalizedName(item as Territory).name,
        value: item.id,
      }));
    }, [dropdownItems, getLocalizedName]);

    // Find selected item name for display
    const getSelectedItemName = useCallback(
      (itemId: string): string => {
        if (!Array.isArray(dropdownItems)) return itemId;

        const item = dropdownItems.find((item) => item.id === itemId);
        return item ? getLocalizedName(item as Territory).name : itemId;
      },
      [dropdownItems, getLocalizedName],
    );

    // Handle toggle of option
    const toggleOption = useCallback(
      (optionValue: string) => {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((val) => val !== optionValue)
          : [...selectedValues, optionValue];

        setSelectedValues(newValues);
        onChange?.(newValues);
      },
      [selectedValues, onChange],
    );

    // Handle clear all selections
    const clearSelection = useCallback(() => {
      setSelectedValues([]);
      onChange?.([]);
    }, [onChange]);

    // Handle toggle all selections
    const toggleAll = useCallback(() => {
      if (selectedValues.length === options.length) {
        clearSelection();
      } else {
        const allValues = options.map((option) => option.value);
        setSelectedValues(allValues);
        onChange?.(allValues);
      }
    }, [selectedValues, options, clearSelection, onChange]);

    // Handle keyboard navigation
    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (
        event.key === "Backspace" &&
        !event.currentTarget.value &&
        selectedValues.length > 0
      ) {
        const newValues = [...selectedValues];
        newValues.pop();
        setSelectedValues(newValues);
        onChange?.(newValues);
      }
    };

    // Handle popover close with onBlur callback
    const handlePopoverOpenChange = (open: boolean) => {
      setIsPopoverOpen(open);
      if (!open && onBlur) {
        onBlur();
      }
    };

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

        <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              ref={mergeRefs(ref, popoverTriggerRef)}
              variant="outline"
              role="combobox"
              aria-expanded={isPopoverOpen}
              className={cn(
                "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-background",
                selectedValues.length > 0 ? "h-auto min-h-10" : "h-10",
                error && "border-destructive",
                "text-left font-normal",
                className,
              )}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              disabled={disabled || isLoading}
              type="button"
              name={name}
            >
              {selectedValues.length > 0 ? (
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-wrap items-center">
                    {selectedValues.slice(0, maxDisplay).map((value) => (
                      <Badge
                        key={value}
                        variant={badgeVariant}
                        className={multiSelectBadgeVariants({
                          variant: badgeVariant,
                        })}
                      >
                        {getSelectedItemName(value)}
                        <XCircle
                          className="ml-2 h-3 w-3 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </Badge>
                    ))}
                    {selectedValues.length > maxDisplay && (
                      <Badge variant="outline" className="m-1 bg-transparent">
                        +{selectedValues.length - maxDisplay}{" "}
                        {t("dropdown.more")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <XIcon
                      className="h-4 mx-2 cursor-pointer text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelection();
                      }}
                    />
                    <Separator
                      orientation="vertical"
                      className="flex min-h-6 h-full"
                    />
                    <ChevronsUpDown className="h-4 mx-2 shrink-0 opacity-50" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-muted-foreground">
                    {placeholder || t("dropdown.select")}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder={t("dropdown.search")}
                onKeyDown={handleInputKeyDown}
              />
              <CommandList>
                <CommandEmpty>
                  {isLoading ? t("dropdown.loading") : t("dropdown.noResults")}
                </CommandEmpty>
                <CommandGroup>
                  {/* Select All option */}
                  {options.length > 0 && (
                    <CommandItem
                      key="select-all"
                      onSelect={toggleAll}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selectedValues.length === options.length
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{t("dropdown.selectAll")}</span>
                    </CommandItem>
                  )}

                  {/* Individual options */}
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => toggleOption(option.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible",
                          )}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between">
                    {selectedValues.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={clearSelection}
                          className="flex-1 justify-center cursor-pointer"
                        >
                          {t("dropdown.clearSelection")}
                        </CommandItem>
                        <Separator
                          orientation="vertical"
                          className="flex min-h-6 h-full"
                        />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className="flex-1 justify-center cursor-pointer"
                    >
                      {t("dropdown.close")}
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <input type="hidden" name={name} value={selectedValues.join(",")} />

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

// Helper function to merge refs
function mergeRefs<T>(
  ...refs: (React.ForwardedRef<T> | React.RefObject<T> | null | undefined)[]
) {
  return (instance: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        // Update to use modern typing approach instead of deprecated casting
        const refObject = ref as React.RefObject<T>;
        // Using Object.defineProperty to avoid the TypeError when setting .current directly
        Object.defineProperty(refObject, "current", {
          value: instance,
          configurable: true,
        });
      }
    });
  };
}

DropdownSelectMultiple.displayName = "DropdownSelectMultiple";
