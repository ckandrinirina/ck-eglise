"use client";

/**
 * @component UserSelect
 * @description A reusable user selection component that works with both React Hook Form and standalone usage
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
import { UserService } from "@/lib/services/user.service";

interface UserSelectProps<TFieldValues extends FieldValues> {
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
 * A reusable user selection component
 * Can be used either with React Hook Form or as a standalone component
 */
const UserSelect = <TFieldValues extends FieldValues>({
  form,
  name,
  value: controlledValue,
  onChange: controlledOnChange,
  label,
  placeholder,
  disabled,
  required,
  className,
}: UserSelectProps<TFieldValues>) => {
  const t = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch users using React Query
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.getUsers(),
  });

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

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
            ? users?.find((user) => user.id === value)?.name || t("unnamed")
            : placeholder || t("selectUser")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t("searchUser")}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{t("noUsersFound")}</CommandEmpty>
            <CommandGroup heading={t("users")}>
              {isLoading ? (
                <CommandItem disabled>{t("loading")}</CommandItem>
              ) : isError ? (
                <CommandItem disabled>{t("errorLoadingUsers")}</CommandItem>
              ) : (
                filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="flex items-center">
                      {user.name || user.email || t("unnamed")}
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === user.id ? "opacity-100" : "opacity-0",
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

export default UserSelect;
