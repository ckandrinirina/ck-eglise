/**
 * @component MoneyGoalCategoryFormModal
 * @description Modal for creating and editing money goal categories
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string|null} categoryId - ID of category to edit (null for create)
 * @returns {JSX.Element} Money goal category form modal component
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { MoneyGoalCategoryService } from "@/lib/services/money-goal-category.service";
import {
  CreateMoneyGoalCategoryRequest,
  UpdateMoneyGoalCategoryRequest,
} from "@/types/money-goals";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameFr: z.string().optional(),
  nameMg: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isEnabled: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface MoneyGoalCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
}

// Predefined color options
const colorOptions = [
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Emerald", value: "#10b981" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Indigo", value: "#6366f1" },
];

export const MoneyGoalCategoryFormModal = ({
  isOpen,
  onClose,
  categoryId,
}: MoneyGoalCategoryFormModalProps) => {
  const t = useTranslations("admin.money_goal_categories");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameFr: "",
      nameMg: "",
      description: "",
      color: "",
      icon: "",
      isEnabled: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMoneyGoalCategoryRequest) =>
      MoneyGoalCategoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-goal-categories"] });
      toast.success(t("form.success.create"));
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(
        (error as Error & { response?: { data?: { error?: string } } }).response
          ?.data?.error || t("form.error.create"),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMoneyGoalCategoryRequest) =>
      MoneyGoalCategoryService.updateCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-goal-categories"] });
      toast.success(t("form.success.update"));
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast.error(
        (error as Error & { response?: { data?: { error?: string } } }).response
          ?.data?.error || t("form.error.update"),
      );
    },
  });

  // Load category data when editing
  useEffect(() => {
    if (categoryId && isOpen) {
      setIsLoading(true);
      MoneyGoalCategoryService.getCategory(categoryId)
        .then((category) => {
          form.setValue("name", category.name);
          form.setValue("nameFr", category.nameFr || "");
          form.setValue("nameMg", category.nameMg || "");
          form.setValue("description", category.description || "");
          form.setValue("color", category.color || "");
          form.setValue("icon", category.icon || "");
          form.setValue("isEnabled", category.isEnabled);
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || t("form.error.load"));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!categoryId && isOpen) {
      form.reset({
        name: "",
        nameFr: "",
        nameMg: "",
        description: "",
        color: "",
        icon: "",
        isEnabled: true,
      });
    }
  }, [categoryId, isOpen, form, t]);

  const onSubmit = (data: FormData) => {
    // Remove empty strings to send undefined instead
    const cleanData = {
      ...data,
      nameFr: data.nameFr || undefined,
      nameMg: data.nameMg || undefined,
      description: data.description || undefined,
      color: data.color || undefined,
      icon: data.icon || undefined,
    };

    if (categoryId) {
      updateMutation.mutate({
        id: categoryId,
        ...cleanData,
      });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {categoryId ? t("form.edit_title") : t("form.create_title")}
          </DialogTitle>
          <DialogDescription>
            {categoryId
              ? t("form.edit_description")
              : t("form.create_description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">{t("form.loading")}</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.fields.name_placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameFr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.name_fr")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.fields.name_fr_placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nameMg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("form.fields.name_mg")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("form.fields.name_mg_placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("form.fields.description_placeholder")}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.color")}</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input
                          placeholder={t("form.fields.color_placeholder")}
                          {...field}
                        />
                        <div className="grid grid-cols-5 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-8 h-8 rounded border-2 ${
                                field.value === color.value
                                  ? "border-gray-800 ring-2 ring-gray-400"
                                  : "border-gray-300"
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t("form.fields.color_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.icon")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.fields.icon_placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("form.fields.icon_description")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("form.fields.enabled")}
                      </FormLabel>
                      <FormDescription>
                        {t("form.fields.enabled_description")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t("form.actions.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("form.actions.saving")
                    : categoryId
                      ? t("form.actions.update")
                      : t("form.actions.create")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
