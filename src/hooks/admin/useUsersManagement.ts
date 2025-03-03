import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserService, User } from "@/lib/services/user.service";

export const useUsersManagement = () => {
  const t = useTranslations("admin.users");
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UserService.getUsers();
      return response.data;
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      await UserService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("dialog.userDeleted"));
    },
    onError: () => {
      toast.error(t("dialog.errorDeleting"));
    },
  });

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (userId: string) => {
      return {
        confirmDelete: () => deleteUser.mutate(userId),
      };
    },
    [deleteUser],
  );

  const handleAdd = useCallback(() => {
    setSelectedUser(null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedUser(null);
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [queryClient]);

  return {
    users,
    isLoading,
    selectedUser,
    dialogOpen,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
  };
};
