import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UserService } from "@/lib/services/user.service";
import {
  User,
  UserSortConfig,
  CreateUserData as UserCreateData,
  UpdateUserData as UserUpdateData,
} from "@/types/users/user";

// Extended local types to match form values
type CreateUserData = UserCreateData;
type UpdateUserData = UserUpdateData;

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
  const [tempTerritoryFilter, setTempTerritoryFilter] = useState<string>("");
  const [territoryFilter, setTerritoryFilter] = useState<string>("");
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
    staleTime: 60000,
    retry: 2,
  });

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = users ?? [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.functions?.some(
            (f) =>
              f.name.toLowerCase().includes(query) ||
              f.nameFr?.toLowerCase().includes(query) ||
              f.nameMg?.toLowerCase().includes(query),
          ) ||
          user.territory?.name.toLowerCase().includes(query) ||
          user.territory?.nameFr?.toLowerCase().includes(query) ||
          user.territory?.nameMg?.toLowerCase().includes(query),
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply territory filter
    if (territoryFilter) {
      result = result.filter((user) => user.territoryId === territoryFilter);
    }

    // Apply sorting
    return result.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.field === "territory") {
        aValue = a.territory?.name || "";
        bValue = b.territory?.name || "";
      } else {
        aValue = a[sortConfig.field];
        bValue = b[sortConfig.field];
      }

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [users, searchQuery, roleFilter, territoryFilter, sortConfig]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setTempSearchQuery("");
    setSearchQuery("");
    setTempRoleFilter("all");
    setRoleFilter("all");
    setTempTerritoryFilter("");
    setTerritoryFilter("");
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
    (userData: CreateUserData | UpdateUserData) => {
      if (selectedUser) {
        const { ...updateData } = userData;
        updateUser.mutate({
          id: selectedUser.id,
          data: updateData,
        });
      } else {
        createUser.mutate(userData as CreateUserData);
      }
    },
    [selectedUser, createUser, updateUser],
  );

  const handleSearchChange = (query: string) => {
    setTempSearchQuery(query);
  };

  const handleRoleFilterChange = (role: "all" | "admin" | "user") => {
    setTempRoleFilter(role);
  };

  const handleTerritoryFilterChange = (territory: string) => {
    setTempTerritoryFilter(territory);
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setRoleFilter(tempRoleFilter);
    setTerritoryFilter(tempTerritoryFilter);
  };

  const handleSort = useCallback((field: UserSortConfig["field"]) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

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
    territoryFilter,
    tempTerritoryFilter,
    sortConfig,
    handleSearchChange,
    handleRoleFilterChange,
    handleTerritoryFilterChange,
    applyFilters,
    handleSort,
    handleClearFilters,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
    handleSaveUser,
  };
};
