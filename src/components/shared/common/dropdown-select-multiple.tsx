"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

// Group UI component imports
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Service and type imports
import { DropdownService } from "@/lib/services/dropdown.service";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { Territory } from "@/types/users/user";

export type DropdownSelectMultipleProps = {
  dropdownKey: string;
  value?: string[] | null | undefined;
  onChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  includeDisabled?: boolean;
  required?: boolean;
  name?: string;
  onBlur?: () => void;
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
export const DropdownSelectMultiple = memo(
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
  }: DropdownSelectMultipleProps) => {
    const t = useTranslations();
    const { getLocalizedName } = useLocalizedName();

    // Ensure value is always an array, even if it's null or undefined
    const safeValue = Array.isArray(value) ? value : [];

    // For multiple selections management
    const [selectedValues, setSelectedValues] = useState<string[]>(safeValue);

    // For command/popover state
    const [open, setOpen] = useState(false);

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

    // Find selected item name for display
    const getSelectedItemName = useCallback(
      (itemId: string): string => {
        if (!Array.isArray(dropdownItems)) return itemId;

        const item = dropdownItems.find((item) => item.id === itemId);
        return item ? getLocalizedName(item as Territory).name : itemId;
      },
      [dropdownItems, getLocalizedName],
    );

    // Handle selection change
    const handleSelectChange = useCallback(
      (selectedValue: string) => {
        let newValues: string[];

        if (selectedValues.includes(selectedValue)) {
          // Remove if already selected
          newValues = selectedValues.filter((v) => v !== selectedValue);
        } else {
          // Add to selection
          newValues = [...selectedValues, selectedValue];
        }

        setSelectedValues(newValues);
        onChange?.(newValues);
      },
      [onChange, selectedValues],
    );

    // Remove item from selection
    const removeItem = useCallback(
      (itemId: string) => {
        const newValues = selectedValues.filter((v) => v !== itemId);
        setSelectedValues(newValues);
        onChange?.(newValues);
      },
      [onChange, selectedValues],
    );

    // Clear all selections
    const clearSelection = useCallback(() => {
      setSelectedValues([]);
      onChange?.([]);
    }, [onChange]);

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

        <div className={cn("flex flex-col gap-1.5", className)}>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between",
                  selectedValues.length > 0 ? "h-auto min-h-10" : "h-10",
                  error && "border-destructive",
                  "text-left font-normal",
                )}
                onClick={() => setOpen(!open)}
                disabled={disabled || isLoading}
                type="button"
              >
                <div className="flex flex-wrap gap-1">
                  {selectedValues.length > 0 ? (
                    selectedValues.map((itemId) => (
                      <Badge key={itemId} variant="secondary" className="m-0.5">
                        {getSelectedItemName(itemId)}
                        <button
                          className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              removeItem(itemId);
                            }
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(itemId);
                          }}
                          type="button"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">
                      {placeholder || t("dropdown.select")}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder={t("dropdown.search")} />
                <CommandEmpty>
                  {isLoading ? t("dropdown.loading") : t("dropdown.noResults")}
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {Array.isArray(dropdownItems) &&
                    dropdownItems.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => handleSelectChange(item.id)}
                        className="flex items-center gap-2"
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selectedValues.includes(item.id)
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <span>{getLocalizedName(item as Territory).name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
                {selectedValues.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-sm"
                      onClick={clearSelection}
                      type="button"
                    >
                      {t("dropdown.clearSelection")}
                    </Button>
                  </div>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <input type="hidden" name={name} value={selectedValues.join(",")} />
        </div>

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

DropdownSelectMultiple.displayName = "DropdownSelectMultiple";
