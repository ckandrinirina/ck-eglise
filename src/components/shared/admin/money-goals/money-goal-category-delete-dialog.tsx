/**
 * @component MoneyGoalCategoryDeleteDialog
 * @description Confirmation dialog for deleting money goal categories
 *
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {function} onClose - Function to close the dialog
 * @param {string|null} categoryId - ID of category to delete
 * @returns {JSX.Element} Money goal category delete dialog component
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoneyGoalCategoryService } from "@/lib/services/money-goal-category.service";
import { MoneyGoalCategory } from "@/types/money-goals";

interface MoneyGoalCategoryDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
}

export const MoneyGoalCategoryDeleteDialog = ({
  isOpen,
  onClose,
  categoryId,
}: MoneyGoalCategoryDeleteDialogProps) => {
  const t = useTranslations("admin.money_goal_categories");
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<MoneyGoalCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => MoneyGoalCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-goal-categories"] });
      queryClient.invalidateQueries({ queryKey: ["money-goals"] });
      toast.success(t("delete.success"));
      onClose();
    },
    onError: (error: Error) => {
      toast.error(
        (error as Error & { response?: { data?: { error?: string } } }).response
          ?.data?.error || t("delete.error"),
      );
    },
  });

  // Load category data when dialog opens
  useEffect(() => {
    if (categoryId && isOpen) {
      setIsLoading(true);
      MoneyGoalCategoryService.getCategory(categoryId)
        .then((categoryData) => {
          setCategory(categoryData);
        })
        .catch((error) => {
          toast.error(error.response?.data?.error || t("delete.load_error"));
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setCategory(null);
    }
  }, [categoryId, isOpen, onClose, t]);

  const handleDelete = () => {
    if (categoryId) {
      deleteMutation.mutate(categoryId);
    }
  };

  const hasGoals = category?.goals && category.goals.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t("delete.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {isLoading ? (
              <p>{t("delete.loading")}</p>
            ) : category ? (
              <>
                <p>{t("delete.description", { name: category.name })}</p>
                {hasGoals && (
                  <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">
                      {t("delete.has_goals_warning", {
                        count: category.goals?.length || 0,
                      })}
                    </p>
                    <p className="text-sm text-destructive mt-1">
                      {t("delete.has_goals_instruction")}
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {t("delete.permanent_warning")}
                </p>
              </>
            ) : (
              <p>{t("delete.error")}</p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t("delete.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending || hasGoals || !category}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending
              ? t("delete.actions.deleting")
              : t("delete.actions.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
