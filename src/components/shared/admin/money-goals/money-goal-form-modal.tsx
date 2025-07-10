/**
 * @component MoneyGoalFormModal
 * @description Modal for creating and editing money goals
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string|null} goalId - ID of goal to edit (null for create)
 * @returns {JSX.Element} Money goal form modal component
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MoneyGoalService } from "@/lib/services/money-goal.service";
import { MoneyGoalCategoryService } from "@/lib/services/money-goal-category.service";
import {
  CreateMoneyGoalRequest,
  UpdateMoneyGoalRequest,
} from "@/types/money-goals";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amountGoal: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  years: z.coerce.number().min(2024, "Year must be valid"),
  categoryId: z.string().min(1, "Category is required"),
});

type FormData = z.infer<typeof formSchema>;

interface MoneyGoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string | null;
}

export const MoneyGoalFormModal = ({
  isOpen,
  onClose,
  goalId,
}: MoneyGoalFormModalProps) => {
  const t = useTranslations("admin.money_goals");
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["money-goal-categories"],
    queryFn: () => MoneyGoalCategoryService.getCategories(),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amountGoal: 0,
      years: new Date().getFullYear(),
      categoryId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMoneyGoalRequest) =>
      MoneyGoalService.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-goals"] });
      queryClient.invalidateQueries({ queryKey: ["money-goals-summary"] });
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
    mutationFn: (data: UpdateMoneyGoalRequest) =>
      MoneyGoalService.updateGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-goals"] });
      queryClient.invalidateQueries({ queryKey: ["money-goals-summary"] });
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

  // Load goal data when editing
  useEffect(() => {
    if (goalId && isOpen) {
      setIsLoading(true);
      MoneyGoalService.getGoal(goalId)
        .then((goal) => {
          form.setValue("name", goal.name);
          form.setValue("amountGoal", goal.amountGoal);
          form.setValue("years", goal.years);
          form.setValue("categoryId", goal.categoryId);
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || t("form.error.load"));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!goalId && isOpen) {
      form.reset({
        name: "",
        amountGoal: 0,
        years: new Date().getFullYear(),
        categoryId: "",
      });
    }
  }, [goalId, isOpen, form, t]);

  const onSubmit = (data: FormData) => {
    if (goalId) {
      updateMutation.mutate({
        id: goalId,
        ...data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {goalId ? t("form.edit_title") : t("form.create_title")}
          </DialogTitle>
          <DialogDescription>
            {goalId ? t("form.edit_description") : t("form.create_description")}
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

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.category")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("form.fields.category_placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              {category.color && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              {category.nameFr || category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.amount_goal")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t("form.fields.amount_goal_placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="years"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.fields.year")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="2024"
                        max="2100"
                        placeholder={t("form.fields.year_placeholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
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
                    : goalId
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
