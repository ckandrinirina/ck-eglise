import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect } from "react";
import { User } from "@/types/users/user";
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

// Schema definitions for user forms
const baseUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
  territoryId: z.string().optional(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const editUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .or(z.literal("")),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  onSave?: (userData: UserFormValues) => void;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserDialogProps) {
  const t = useTranslations("admin.users");

  // Determine which schema to use based on whether we're editing or creating
  const schema = user ? editUserSchema : createUserSchema;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: (user?.role as "user" | "admin") || "user",
      password: "",
      territoryId: user?.territoryId || "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  // Reset form when user prop changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name || "",
        email: user?.email || "",
        role: (user?.role as "user" | "admin") || "user",
        password: "", // Always reset password field
        territoryId: user?.territoryId || "",
      });
    }
  }, [user, open, form]);

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    // Remove empty password when editing
    if (user && data.password === "") {
      const { ...restData } = data;
      onSave?.(restData);
    } else {
      onSave?.(data);
    }
  };

  // Get form validation state
  const { isValid, isDirty, isSubmitting } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t(user ? "dialog.editUser" : "dialog.createUser")}
          </DialogTitle>
          <DialogDescription>
            {t(user ? "dialog.editUserDesc" : "dialog.createUserDesc")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("form.emailPlaceholder")}
                      {...field}
                      disabled={!!user} // Disable email editing for existing users
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="territoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.territory")}</FormLabel>
                  <FormControl>
                    <DropdownSelect
                      dropdownKey="territory"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("form.territoryDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {user ? t("form.newPassword") : t("form.password")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        user
                          ? t("form.newPasswordPlaceholder")
                          : t("form.passwordPlaceholder")
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {user && (
                    <p className="text-xs text-muted-foreground">
                      {t("form.passwordHint")}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.role")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectRole")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">{t("form.roleUser")}</SelectItem>
                      <SelectItem value="admin">
                        {t("form.roleAdmin")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("dialog.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!isValid || !isDirty || isSubmitting}
              >
                {t(user ? "dialog.save" : "dialog.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
