import { useState, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { DropdownService } from "@/lib/services/dropdown.service";
import {
  Dropdown,
  DropdownSortConfig,
  CreateDropdownData,
  UpdateDropdownData,
} from "@/types/dropdowns/dropdown";

// Define type for grouped dropdowns
type GroupedDropdown = {
  parent?: Dropdown;
  children: Dropdown[];
};

type GroupedDropdowns = {
  [key: string]: GroupedDropdown;
};

/**
 * Hook for managing dropdowns in the admin interface
 * Includes state management, CRUD operations, filtering, sorting
 */
export const useDropdownsManagement = () => {
  const t = useTranslations("admin.dropdowns");
  const queryClient = useQueryClient();

  // State management
  const [selectedDropdown, setSelectedDropdown] = useState<Dropdown | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempParentFilter, setTempParentFilter] = useState<string>("all");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [showDisabled, setShowDisabled] = useState(false);
  const [sortConfig, setSortConfig] = useState<DropdownSortConfig>({
    field: "name",
    direction: "asc",
  });

  // Query to fetch all dropdowns with optional filtering
  const {
    data: dropdownsData = [],
    isLoading,
    isError,
  } = useQuery<Dropdown[]>({
    queryKey: ["dropdowns", parentFilter, showDisabled],
    queryFn: async () => {
      // Build filter parameters
      const params: Record<string, boolean | string> = {
        includeDisabled: showDisabled,
      };

      // Apply parent filter if specified
      if (parentFilter === "parents-only") {
        params.isParent = true;
      } else if (parentFilter !== "all") {
        params.parentId = parentFilter;
      }

      const response = await DropdownService.getDropdowns(params);
      return response.data;
    },
    staleTime: 60000, // 1 minute before refetch
    retry: 2,
  });

  // Query to fetch parent categories for filtering
  const { data: parentCategories = [] } = useQuery<Dropdown[]>({
    queryKey: ["parentCategories"],
    queryFn: async () => {
      const response = await DropdownService.getParentDropdowns(true);
      return response.data;
    },
    staleTime: 300000, // 5 minutes before refetch
  });

  // Filter and sort dropdowns
  const filteredAndSortedDropdowns = useMemo(() => {
    let result = dropdownsData ?? [];

    // Apply search filter if specified
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (dropdown) =>
          dropdown.name?.toLowerCase().includes(query) ||
          dropdown.nameFr?.toLowerCase().includes(query) ||
          dropdown.nameMg?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    return result.sort((a, b) => {
      // Special handling for isParent field to ensure parents come first
      if (sortConfig.field === "isParent") {
        if (sortConfig.direction === "asc") {
          // Sort with parents first
          return a.isParent === b.isParent ? 0 : a.isParent ? -1 : 1;
        } else {
          // Sort with parents last
          return a.isParent === b.isParent ? 0 : a.isParent ? 1 : -1;
        }
      }

      // For other fields
      const aValue = a[sortConfig.field] as string | number;
      const bValue = b[sortConfig.field] as string | number;

      if (aValue === undefined || bValue === undefined) return 0;

      // Handle date sorting
      if (sortConfig.field === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      // Handle string sorting
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [dropdownsData, searchQuery, sortConfig]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setTempSearchQuery("");
    setSearchQuery("");
    setTempParentFilter("all");
    setParentFilter("all");
    setShowDisabled(false);
    setSortConfig({ field: "name", direction: "asc" });
  }, []);

  // Toggle dropdown enabled/disabled status
  const toggleDropdownStatus = useMutation({
    mutationFn: async ({
      id,
      isEnabled,
    }: {
      id: string;
      isEnabled: boolean;
    }) => {
      return await DropdownService.toggleDropdownStatus(id, isEnabled);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dropdowns"] });
      const message = variables.isEnabled
        ? t("dialog.dropdownEnabled")
        : t("dialog.dropdownDisabled");
      toast.success(message);
    },
    onError: (error) => {
      console.error("Error toggling dropdown status:", error);
      toast.error(t("dialog.errorUpdating"));
    },
  });

  // Create dropdown mutation
  const createDropdown = useMutation({
    mutationFn: (data: CreateDropdownData) =>
      DropdownService.createDropdown(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdowns"] });
      queryClient.invalidateQueries({ queryKey: ["parentCategories"] });
      toast.success(t("dialog.dropdownCreated"));
      handleDialogClose();
    },
    onError: (error) => {
      console.error("Error creating dropdown:", error);
      toast.error(t("dialog.errorCreating"));
    },
  });

  // Update dropdown mutation
  const updateDropdown = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDropdownData }) =>
      DropdownService.updateDropdown(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdowns"] });
      queryClient.invalidateQueries({ queryKey: ["parentCategories"] });
      toast.success(t("dialog.dropdownUpdated"));
      handleDialogClose();
    },
    onError: (error) => {
      console.error("Error updating dropdown:", error);
      toast.error(t("dialog.errorUpdating"));
    },
  });

  // Event handlers
  const handleEdit = useCallback((dropdown: Dropdown) => {
    setSelectedDropdown(dropdown);
    setDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (dropdown: Dropdown) => {
      toggleDropdownStatus.mutate({
        id: dropdown.id,
        isEnabled: !dropdown.isEnabled,
      });
    },
    [toggleDropdownStatus],
  );

  const handleAdd = useCallback(() => {
    setSelectedDropdown(null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setTimeout(() => {
      setSelectedDropdown(null);
    }, 300); // Clear selected dropdown after dialog animation completes
  }, []);

  const handleSaveDropdown = useCallback(
    (dropdownData: CreateDropdownData) => {
      if (selectedDropdown) {
        updateDropdown.mutate({
          id: selectedDropdown.id,
          data: dropdownData,
        });
      } else {
        createDropdown.mutate(dropdownData);
      }
    },
    [selectedDropdown, createDropdown, updateDropdown],
  );

  // Filter handlers
  const handleSearchChange = (query: string) => {
    setTempSearchQuery(query);
  };

  const handleParentFilterChange = (parentId: string) => {
    setTempParentFilter(parentId);
  };

  const handleShowDisabledChange = (show: boolean) => {
    setShowDisabled(show);
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setParentFilter(tempParentFilter);
  };

  const handleSort = useCallback((field: DropdownSortConfig["field"]) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Group dropdowns by parent
  const groupedDropdowns = useMemo(() => {
    const grouped: GroupedDropdowns = {};

    filteredAndSortedDropdowns.forEach((dropdown) => {
      if (dropdown.isParent) {
        grouped[dropdown.id] = {
          parent: dropdown,
          children:
            dropdown.children
              ?.map((dc) =>
                filteredAndSortedDropdowns.find((d) => d.id === dc.id),
              )
              .filter((d): d is Dropdown => d !== undefined) || [],
        };
      }
    });

    return grouped;
  }, [filteredAndSortedDropdowns]);

  // Extract only parent dropdowns for the accordion
  const parentDropdownGroups = Object.entries(groupedDropdowns)
    .filter(([, group]) => group.parent) // Only include groups with a parent
    .map(([id, group]) => ({
      id,
      parent: group.parent as Dropdown,
      children: group.children || [],
    }));

  // Get standalone dropdowns (those without parents)
  const standaloneDropdowns = groupedDropdowns["standalone"]?.children || [];

  return {
    dropdowns: filteredAndSortedDropdowns,
    isLoading,
    isError,
    selectedDropdown,
    dialogOpen,
    searchQuery,
    tempSearchQuery,
    parentFilter,
    tempParentFilter,
    showDisabled,
    sortConfig,
    parentCategories,
    handleSearchChange,
    handleParentFilterChange,
    handleShowDisabledChange,
    applyFilters,
    handleSort,
    handleClearFilters,
    handleEdit,
    handleToggleStatus,
    handleAdd,
    handleDialogClose,
    handleSaveDropdown,
    parentDropdownGroups,
    standaloneDropdowns,
  };
};
