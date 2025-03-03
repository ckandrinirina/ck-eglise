import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserService } from "@/lib/services/user.service";
import { User, UserSortConfig } from "@/types/user";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

type UpdateUserData = Partial<Omit<CreateUserData, "password">>;

export const useUsersManagement = () => {
  const t = useTranslations("admin.users");
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempRoleFilter, setTempRoleFilter] = useState<
    "all" | "admin" | "user"
  >("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [sortConfig, setSortConfig] = useState<UserSortConfig>({
    field: "name",
    direction: "asc",
  });

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["users", roleFilter],
    queryFn: async () => {
      const response = await UserService.getUsers(
        roleFilter !== "all" ? { role: roleFilter } : undefined,
      );
      return response.data;
    },
    staleTime: 60000, // 1 minute before refetch
    retry: 2,
  });

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    const result = users ?? [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return result.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query),
      );
    }

    return result.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (!aValue || !bValue) return 0;

      if (sortConfig.field === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [users, searchQuery, sortConfig]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setTempSearchQuery("");
    setSearchQuery("");
    setTempRoleFilter("all");
    setRoleFilter("all");
    setSortConfig({ field: "name", direction: "asc" });
  }, []);

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
    mutationFn: (data: CreateUserData) => UserService.createUser(data),
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
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
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
    (userData: CreateUserData) => {
      if (selectedUser) {
        const { ...updateData } = userData;
        updateUser.mutate({
          id: selectedUser.id,
          data: updateData,
        });
      } else {
        createUser.mutate(userData);
      }
    },
    [selectedUser, createUser, updateUser, t],
  );

  const handleSearchChange = (query: string) => {
    setTempSearchQuery(query);
  };

  const handleRoleFilterChange = (role: "all" | "admin" | "user") => {
    setTempRoleFilter(role);
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setRoleFilter(tempRoleFilter);
  };

  return {
    users: filteredAndSortedUsers,
    isLoading,
    isError,
    selectedUser,
    dialogOpen,
    searchQuery,
    tempSearchQuery,
    roleFilter,
    tempRoleFilter,
    sortConfig,
    handleSearchChange,
    handleRoleFilterChange,
    applyFilters,
    handleClearFilters,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
    handleSaveUser,
  };
};
