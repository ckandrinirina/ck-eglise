/**
 * @component MoneyGoalDeleteDialog
 * @description Dialog for confirming money goal deletion
 *
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {function} onClose - Function to close the dialog
 * @param {string|null} goalId - ID of goal to delete
 * @returns {JSX.Element} Money goal delete dialog component
 */

"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { MoneyGoalService } from "@/lib/services/money-goal.service";

interface MoneyGoalDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string | null;
}

export const MoneyGoalDeleteDialog = ({
  isOpen,
  onClose,
  goalId,
}: MoneyGoalDeleteDialogProps) => {
  const t = useTranslations("admin.money_goals");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => MoneyGoalService.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["money-goals"] });
      queryClient.invalidateQueries({ queryKey: ["money-goals-summary"] });
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

  const handleDelete = () => {
    if (goalId) {
      deleteMutation.mutate(goalId);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("delete.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            {t("delete.actions.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
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
