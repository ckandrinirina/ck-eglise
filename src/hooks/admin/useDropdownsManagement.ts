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

export const useDropdownsManagement = () => {
  const t = useTranslations("admin.dropdowns");
  const queryClient = useQueryClient();
  const [selectedDropdown, setSelectedDropdown] = useState<Dropdown | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [tempTypeFilter, setTempTypeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<DropdownSortConfig>({
    field: "name",
    direction: "asc",
  });

  // Query to fetch dropdowns with optional type filtering
  const {
    data: dropdowns = [],
    isLoading,
    isError,
  } = useQuery<Dropdown[]>({
    queryKey: ["dropdowns", typeFilter],
    queryFn: async () => {
      const response = await DropdownService.getDropdowns(
        typeFilter !== "all" ? { type: typeFilter } : undefined,
      );
      return response.data;
    },
    staleTime: 60000, // 1 minute before refetch
    retry: 2,
  });

  // Get all available dropdown types for filtering (constant)
  const dropdownTypes = useMemo(() => {
    return ["territory", "role", "branch"].sort();
  }, []); // No dependencies since it's a constant array

  // Filter and sort dropdowns
  const filteredAndSortedDropdowns = useMemo(() => {
    const result = dropdowns ?? [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return result.filter(
        (dropdown) =>
          dropdown.name?.toLowerCase().includes(query) ||
          dropdown.nameFr?.toLowerCase().includes(query) ||
          dropdown.nameMg?.toLowerCase().includes(query) ||
          dropdown.type?.toLowerCase().includes(query),
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
  }, [dropdowns, searchQuery, sortConfig]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setTempSearchQuery("");
    setSearchQuery("");
    setTempTypeFilter("all");
    setTypeFilter("all");
    setSortConfig({ field: "name", direction: "asc" });
  }, []);

  // Delete dropdown mutation
  const deleteDropdown = useMutation({
    mutationFn: async (dropdownId: string) => {
      return await DropdownService.deleteDropdown(dropdownId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdowns"] });
      toast.success(t("dialog.dropdownDeleted"));
    },
    onError: (error) => {
      console.error("Error deleting dropdown:", error);
      toast.error(t("dialog.errorDeleting"));
    },
  });

  // Create dropdown mutation
  const createDropdown = useMutation({
    mutationFn: (data: CreateDropdownData) =>
      DropdownService.createDropdown(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dropdowns"] });
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
      toast.success(t("dialog.dropdownUpdated"));
      handleDialogClose();
    },
    onError: (error) => {
      console.error("Error updating dropdown:", error);
      toast.error(t("dialog.errorUpdating"));
    },
  });

  const handleEdit = useCallback((dropdown: Dropdown) => {
    setSelectedDropdown(dropdown);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (dropdownId: string) => {
      return {
        confirmDelete: () => deleteDropdown.mutate(dropdownId),
      };
    },
    [deleteDropdown],
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
        const { ...updateData } = dropdownData;
        updateDropdown.mutate({
          id: selectedDropdown.id,
          data: updateData,
        });
      } else {
        createDropdown.mutate(dropdownData);
      }
    },
    [selectedDropdown, createDropdown, updateDropdown],
  );

  const handleSearchChange = (query: string) => {
    setTempSearchQuery(query);
  };

  const handleTypeFilterChange = (type: string) => {
    setTempTypeFilter(type);
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setTypeFilter(tempTypeFilter);
  };

  const handleSort = useCallback((field: DropdownSortConfig["field"]) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  return {
    dropdowns: filteredAndSortedDropdowns,
    isLoading,
    isError,
    selectedDropdown,
    dialogOpen,
    searchQuery,
    tempSearchQuery,
    typeFilter,
    tempTypeFilter,
    sortConfig,
    dropdownTypes,
    handleSearchChange,
    handleTypeFilterChange,
    applyFilters,
    handleSort,
    handleClearFilters,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
    handleSaveDropdown,
  };
};
