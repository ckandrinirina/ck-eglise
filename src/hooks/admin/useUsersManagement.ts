import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserService } from "@/lib/services/user.service";
import { User, UserSortConfig } from "@/types/user";
import debounce from "lodash/debounce";

export const useUsersManagement = () => {
  const t = useTranslations("admin.users");
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [sortConfig, setSortConfig] = useState<UserSortConfig>({
    field: "name",
    direction: "asc",
  });

  // Fetch users with improved caching strategy
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", roleFilter],
    queryFn: async () => {
      const response = await UserService.getUsers(
        roleFilter !== "all" ? { role: roleFilter } : undefined,
      );
      return response.data;
    },
    staleTime: 60000, // 1 minute before refetch
    cacheTime: 300000, // 5 minutes cache
    retry: 2,
    onError: () => {
      toast.error(t("dialog.errorLoading"));
    },
  });

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (!aValue || !bValue) return 0;

      let comparison = 0;
      if (typeof aValue === "string") {
        comparison = aValue.localeCompare(bValue as string);
      } else {
        comparison =
          new Date(aValue).getTime() - new Date(bValue as string).getTime();
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [users, searchQuery, sortConfig]);

  // Debounced search handler
  const handleSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
      }, 300),
    [],
  );

  // Sort handler
  const handleSort = useCallback((field: UserSortConfig["field"]) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Filter handler
  const handleFilterRole = useCallback((role: typeof roleFilter) => {
    setRoleFilter(role);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
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
    users: filteredAndSortedUsers,
    isLoading,
    isError,
    selectedUser,
    dialogOpen,
    searchQuery,
    roleFilter,
    sortConfig,
    handleSearch,
    handleSort,
    handleFilterRole,
    handleClearFilters,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
    handleSaveUser,
  };
};
