import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserService } from "@/lib/services/user.service";
import { User } from "@/types/user";

export const useUsersManagement = () => {
  const t = useTranslations("admin.users");
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch users with improved caching strategy
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UserService.getUsers();
      return response.data;
    },
    staleTime: 60000, // 1 minute before refetch
    cacheTime: 300000, // 5 minutes cache
    retry: 2,
    onError: () => {
      toast.error(t("dialog.errorLoading"));
    },
  });

  // Sort users by role and name for better display
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      // Sort by role first (admin first, then user)
      if (a.role !== b.role) {
        return a.role === "admin" ? -1 : 1;
      }
      // Then by name
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [users]);

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      return await UserService.deleteUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("dialog.userDeleted"));
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error(t("dialog.errorDeleting"));
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: UserService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("dialog.userCreated"));
      handleDialogClose();
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error(t("dialog.errorCreating"));
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      UserService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(t("dialog.userUpdated"));
      handleDialogClose();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error(t("dialog.errorUpdating"));
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
    setTimeout(() => {
      setSelectedUser(null);
    }, 300); // Clear selected user after dialog animation completes
  }, []);

  const handleSaveUser = useCallback(
    (userData: Partial<User>) => {
      if (selectedUser) {
        updateUser.mutate({
          id: selectedUser.id,
          data: userData,
        });
      } else {
        createUser.mutate(userData);
      }
    },
    [selectedUser, createUser, updateUser],
  );

  return {
    users: sortedUsers,
    isLoading,
    isError,
    selectedUser,
    dialogOpen,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
    handleSaveUser,
  };
};
