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
import { toast } from "sonner";
import * as z from "zod";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const baseUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
  role: z.enum(["user", "admin"]),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
});

const editUserSchema = baseUserSchema.extend({
  password: z.string().min(8).optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}

export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const t = useTranslations("admin.users");
  const queryClient = useQueryClient();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(user ? editUserSchema : createUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: (user?.role as "user" | "admin") || "user",
      password: undefined,
    },
  });

  // Reset form when user prop changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: user?.name || "",
        email: user?.email || "",
        role: (user?.role as "user" | "admin") || "user",
      });
    }
  }, [user, open, form]);

  async function onSubmit(data: UserFormValues) {
    toast.promise(
      async () => {
        const url = user ? `/api/users/${user.id}` : "/api/users";
        const res = await fetch(url, {
          method: user ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await res.text();
          throw new Error(error || "Failed to save user");
        }

        queryClient.invalidateQueries({ queryKey: ["users"] });
        onOpenChange(false);
      },
      {
        loading: t("dialog.saving"),
        success: t(user ? "dialog.userUpdated" : "dialog.userCreated"),
        error: t("dialog.errorSaving"),
      },
    );
  }

  // Get form validation state
  const { isValid, isDirty } = form.formState;

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
                    <Input {...field} />
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
                      {...field}
                      disabled={!!user} // Disable field when editing existing user
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!user && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.password")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
              <Button type="submit" disabled={!isValid || !isDirty}>
                {t(user ? "dialog.save" : "dialog.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
