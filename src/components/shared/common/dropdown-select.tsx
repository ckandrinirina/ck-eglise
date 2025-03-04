"use client";

import { memo, useState, useEffect, useCallback } from "react";
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

export type DropdownSelectProps = {
  dropdownKey: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  isMultiple?: boolean;
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
 * DropdownSelect component for selecting values from predefined dropdown lists
 *
 * @component
 * @example
 * // Single selection
 * <DropdownSelect dropdownKey="territory" onChange={handleChange} />
 *
 * // Multiple selection
 * <DropdownSelect dropdownKey="branch" isMultiple onChange={handleMultiChange} />
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
export const DropdownSelect = memo(
  ({
    dropdownKey,
    value,
    onChange,
    isMultiple = false,
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

    // For multiple selections management
    const [selectedValues, setSelectedValues] = useState<string[]>(
      Array.isArray(value) ? value : value ? [value] : [],
    );

    // For command/popover state
    const [open, setOpen] = useState(false);

    // Update local state when external value changes
    useEffect(() => {
      if (Array.isArray(value)) {
        setSelectedValues(value);
      } else if (value) {
        setSelectedValues([value]);
      } else {
        setSelectedValues([]);
      }
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
        const item = dropdownItems.find((item) => item.id === itemId);
        return item ? getLocalizedName(item).name : itemId;
      },
      [dropdownItems, getLocalizedName],
    );

    // Handle selection change
    const handleSelectChange = useCallback(
      (selectedValue: string) => {
        if (isMultiple) {
          let newValues;

          if (selectedValues.includes(selectedValue)) {
            // Remove if already selected
            newValues = selectedValues.filter((v) => v !== selectedValue);
          } else {
            // Add to selection
            newValues = [...selectedValues, selectedValue];
          }

          setSelectedValues(newValues);
          onChange?.(newValues);
        } else {
          // Single selection
          setSelectedValues([selectedValue]);
          onChange?.(selectedValue);
          setOpen(false);
        }
      },
      [isMultiple, onChange, selectedValues],
    );

    // Remove item from selection (for multiple mode)
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
      onChange?.(isMultiple ? [] : "");
    }, [isMultiple, onChange]);

    // Render single select dropdown
    const renderSingleSelect = () => (
      <Select
        value={selectedValues[0] || ""}
        onValueChange={(value) => {
          setSelectedValues([value]);
          onChange?.(value);
        }}
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
          {dropdownItems.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              {isLoading ? t("dropdown.loading") : t("dropdown.noOptions")}
            </p>
          ) : (
            dropdownItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {getLocalizedName(item).name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    );

    // Render multi-select dropdown
    const renderMultiSelect = () => (
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
                {dropdownItems.map((item) => (
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
                    <span>{getLocalizedName(item).name}</span>
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
    );

    // The complete component with optional label and error
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

        {isMultiple ? renderMultiSelect() : renderSingleSelect()}

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
