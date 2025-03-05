/**
 * @component UserSelect
 * @description A reusable user selection component that works with both React Hook Form and standalone usage
 */

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { User } from "@/types/users/user";
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
  className,
}: UserSelectProps<TFieldValues>) => {
  const t = useTranslations("common");

  // Fetch users using React Query
  const {
    data: users,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => UserService.getUsers(),
  });

  // If form is provided, render with React Hook Form integration
  if (form && name) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className={className}>
            {label && <FormLabel>{label}</FormLabel>}
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled || isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder || t("selectUser")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {renderOptions(users, isLoading, isError, t)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Otherwise render as a standalone component
  return (
    <Select
      onValueChange={controlledOnChange}
      value={controlledValue}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || t("selectUser")} />
      </SelectTrigger>
      <SelectContent>
        {renderOptions(users, isLoading, isError, t)}
      </SelectContent>
    </Select>
  );
};

// Helper function to render select options
const renderOptions = (
  users: User[] | undefined,
  isLoading: boolean,
  isError: boolean,
  t: (key: string) => string,
) => {
  if (isLoading) {
    return <SelectItem value="_loading">{t("loading")}</SelectItem>;
  }

  if (isError) {
    return <SelectItem value="_error">{t("errorLoadingUsers")}</SelectItem>;
  }

  if (!users?.length) {
    return <SelectItem value="_empty">{t("noUsersFound")}</SelectItem>;
  }

  return users.map((user: User) => (
    <SelectItem key={user.id} value={user.id}>
      {user.name || user.email || t("unnamed")}
    </SelectItem>
  ));
};

export default UserSelect;
