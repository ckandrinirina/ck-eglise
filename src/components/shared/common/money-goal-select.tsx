"use client";

/**
 * @component MoneyGoalSelect
 * @description A reusable money goal selection component that works with both React Hook Form and standalone usage
 */

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { MoneyGoalService } from "@/lib/services/money-goal.service";

interface MoneyGoalSelectProps<TFieldValues extends FieldValues> {
  // Form integration props
  form?: UseFormReturn<TFieldValues>;
  name?: Path<TFieldValues>;
  // Standalone props
  value?: string;
  onChange?: (value: string) => void;
  // Common props
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * A reusable money goal selection component
 * Can be used either with React Hook Form or as a standalone component
 */
const MoneyGoalSelect = <TFieldValues extends FieldValues>({
  form,
  name,
  value: controlledValue,
  onChange: controlledOnChange,
  label,
  placeholder,
  disabled,
  required,
  className,
}: MoneyGoalSelectProps<TFieldValues>) => {
  const t = useTranslations("finance");
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch active money goals using React Query
  const {
    data: goals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["money-goals", { status: "active" }],
    queryFn: () => MoneyGoalService.getGoals({ status: "active" }),
  });

  // Filter goals based on search query
  const filteredGoals = React.useMemo(() => {
    if (!searchQuery) return goals;
    const query = searchQuery.toLowerCase();
    return goals.filter((goal) => goal.name?.toLowerCase().includes(query));
  }, [goals, searchQuery]);

  const renderCombobox = (value: string, onChange: (value: string) => void) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || isLoading}
        >
          {value
            ? goals?.find((goal) => goal.id === value)?.name || t("unknownGoal")
            : placeholder || t("selectMoneyGoal")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchMoneyGoal")}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{t("noMoneyGoalsFound")}</CommandEmpty>
            <CommandGroup heading={t("moneyGoals")}>
              {isLoading ? (
                <CommandItem disabled>{t("loading")}</CommandItem>
              ) : isError ? (
                <CommandItem disabled>
                  {t("errorLoadingMoneyGoals")}
                </CommandItem>
              ) : (
                filteredGoals.map((goal) => (
                  <CommandItem
                    key={goal.id}
                    value={goal.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.totalContributions || 0} / {goal.amountGoal} (
                          {goal.years})
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === goal.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  // If form is provided, render with React Hook Form integration
  if (form && name) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            {label && (
              <FormLabel
                className={cn(
                  required &&
                    "after:content-['*'] after:text-destructive after:ml-0.5",
                )}
              >
                {label}
              </FormLabel>
            )}
            <FormControl>
              {renderCombobox(field.value, field.onChange)}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Otherwise render as a standalone component
  return renderCombobox(
    controlledValue || "",
    controlledOnChange || (() => {}),
  );
};

export default MoneyGoalSelect;
