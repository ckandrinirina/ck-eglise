"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  Plus,
  AlertCircle,
  Search,
  X,
  ArrowUpDown,
  Check,
  Ban,
  Layers,
  ChevronRight,
  Key,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DropdownDialog } from "@/components/shared/admin/dropdowns/dropdown-dialog";
import { format } from "date-fns";
import { useDropdownsManagement } from "@/hooks/admin/useDropdownsManagement";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dropdown } from "@/types/dropdowns/dropdown";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { DropdownUser } from "@/types/users/user";

export default function DropdownsPage() {
  const t = useTranslations("admin.dropdowns");
  const { getLocalizedName } = useLocalizedName();
  const {
    dropdowns,
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
  } = useDropdownsManagement();

  const getLocalizedDisplay = (dropdown: Dropdown) => {
    const { name, isFallback } = getLocalizedName(dropdown as DropdownUser);

    return (
      <div className="flex items-center gap-2">
        {/* Add indent for child items */}
        {!dropdown.isParent && dropdown.parentId && (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}

        <span
          className={
            !dropdown.isEnabled ? "text-muted-foreground line-through" : ""
          }
        >
          {name}
        </span>

        {isFallback && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-muted-foreground text-xs">(default)</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("translation.fallback")}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {dropdown.isParent && (
          <Badge variant="outline" className="ml-2">
            <Layers className="h-3 w-3 mr-1" />
            {t("table.parent")}
          </Badge>
        )}

        {dropdown.isParent && dropdown.key && (
          <Badge
            variant="outline"
            className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
          >
            <Key className="h-3 w-3 mr-1" />
            {dropdown.key}
          </Badge>
        )}

        {!dropdown.isEnabled && (
          <Badge variant="outline" className="ml-2 bg-muted">
            {t("table.disabled")}
          </Badge>
        )}
      </div>
    );
  };

  const showToggleStatusConfirmation = (dropdown: Dropdown) => {
    const action = dropdown.isEnabled ? "disable" : "enable";

    toast.custom(
      () => (
        <div className="rounded-lg bg-background p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-medium">
            {t(
              `dialog.confirm${action.charAt(0).toUpperCase() + action.slice(1)}`,
            )}
          </h3>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
              {t("dialog.cancel")}
            </Button>
            <Button
              variant={dropdown.isEnabled ? "destructive" : "default"}
              size="sm"
              onClick={() => {
                handleToggleStatus(dropdown);
                toast.dismiss();
              }}
            >
              {t(`dialog.${action}`)}
            </Button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "bottom-center",
      },
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Card className="p-6">
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="space-y-4 p-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Card className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription>{t("error.description")}</AlertDescription>
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t("buttons.add")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Search filter */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t("filters.searchPlaceholder")}
              value={tempSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Parent category filter */}
          <div className="w-[200px]">
            <Select
              value={tempParentFilter}
              onValueChange={handleParentFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.parentAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.parentAll")}</SelectItem>
                <SelectItem value="parents-only">
                  {t("filters.parentsOnly")}
                </SelectItem>
                {parentCategories.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Show disabled switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-disabled"
              checked={showDisabled}
              onCheckedChange={handleShowDisabledChange}
            />
            <label htmlFor="show-disabled" className="text-sm cursor-pointer">
              {t("filters.showDisabled")}
            </label>
          </div>

          {/* Apply/Clear filters */}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={applyFilters} size="sm">
              <Search className="mr-2 h-4 w-4" />
              {t("filters.apply")}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              size="sm"
              disabled={!searchQuery && parentFilter === "all" && !showDisabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        {isError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error.title")}</AlertTitle>
            <AlertDescription>{t("error.description")}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : dropdowns.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t("noData")}</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      {t("table.name")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "name"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("isParent")}
                  >
                    <div className="flex items-center">
                      {t("table.category")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "isParent"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      {t("table.createdAt")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "createdAt"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    {t("table.status")}
                  </TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dropdowns.map((dropdown) => (
                  <TableRow
                    key={dropdown.id}
                    className={!dropdown.isEnabled ? "opacity-60" : ""}
                  >
                    <TableCell>{getLocalizedDisplay(dropdown)}</TableCell>
                    <TableCell>
                      {dropdown.isParent ? (
                        t("table.parentCategory")
                      ) : dropdown.parent ? (
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          {dropdown.parent.name}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(dropdown.createdAt), "PPP")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {dropdown.isEnabled ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {t("table.enabled")}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            {t("table.disabled")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  aria-label={t("buttons.options")}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("buttons.options")}</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(dropdown)}
                            >
                              {t("buttons.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                showToggleStatusConfirmation(dropdown)
                              }
                            >
                              {dropdown.isEnabled
                                ? t("buttons.disable")
                                : t("buttons.enable")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <DropdownDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        dropdown={selectedDropdown || undefined}
        onSave={handleSaveDropdown}
      />
    </div>
  );
}
