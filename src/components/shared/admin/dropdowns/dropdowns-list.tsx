"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MoreHorizontal,
  Plus,
  AlertCircle,
  Search,
  X,
  Check,
  Ban,
  Layers,
  ChevronRight,
  Key,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { useDropdownsManagement } from "@/hooks/admin/useDropdownsManagement";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dropdown } from "@/types/dropdowns/dropdown";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { DropdownUser } from "@/types/users/user";
import { DropdownDialog } from "@/components/shared/admin/dropdowns/dropdown-dialog";

/**
 * DropdownsList component for displaying and managing dropdowns
 * Uses accordion to group dropdowns by parent
 */
const DropdownsList = () => {
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
    parentCategories,
    handleSearchChange,
    handleParentFilterChange,
    handleShowDisabledChange,
    applyFilters,
    handleClearFilters,
    handleEdit,
    handleToggleStatus,
    handleAdd,
    handleDialogClose,
    handleSaveDropdown,
    parentDropdownGroups,
    standaloneDropdowns,
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
              <p>{t("dropdowns.translation.fallback")}</p>
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
      <Card className="p-6">
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("error.title")}</AlertTitle>
          <AlertDescription>{t("error.description")}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Render dropdown row
  const renderDropdownRow = (dropdown: Dropdown) => (
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
      <TableCell>{format(new Date(dropdown.createdAt), "PPP")}</TableCell>
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
              <DropdownMenuItem onClick={() => handleEdit(dropdown)}>
                {t("buttons.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => showToggleStatusConfirmation(dropdown)}
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
  );

  // Table headers
  const tableHeaders = (
    <TableHeader>
      <TableRow>
        <TableHead>
          <div className="flex items-center">{t("table.name")}</div>
        </TableHead>
        <TableHead>
          <div className="flex items-center">{t("table.category")}</div>
        </TableHead>
        <TableHead>
          <div className="flex items-center">{t("table.createdAt")}</div>
        </TableHead>
        <TableHead className="text-center">{t("table.status")}</TableHead>
        <TableHead className="w-[80px]"></TableHead>
      </TableRow>
    </TableHeader>
  );

  return (
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

      {/* Table with accordion for parent/child grouping */}
      {dropdowns.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">{t("noData")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Parent dropdowns with children in accordion */}
          {parentDropdownGroups.length > 0 && (
            <Accordion type="multiple" className="w-full">
              {parentDropdownGroups.map((group) => (
                <AccordionItem
                  key={group.id}
                  value={group.id}
                  className="border rounded-md mb-2"
                >
                  <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                    <div className="flex items-center gap-2 w-full">
                      {getLocalizedDisplay(group.parent)}
                      <Badge variant="outline" className="ml-auto">
                        {group.children.length}{" "}
                        {t("items", { count: group.children.length })}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        {tableHeaders}
                        <TableBody>
                          {/* Remove parent row from accordion content */}
                          {/* Only include child rows */}
                          {group.children.map((child: Dropdown) =>
                            renderDropdownRow(child),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* Standalone dropdowns (without parents) */}
          {standaloneDropdowns.length > 0 && (
            <div className="rounded-md border overflow-hidden">
              <Table>
                {tableHeaders}
                <TableBody>
                  {standaloneDropdowns.map((dropdown: Dropdown) =>
                    renderDropdownRow(dropdown),
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <DropdownDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        dropdown={selectedDropdown || undefined}
        onSave={handleSaveDropdown}
      />
    </Card>
  );
};

export default DropdownsList;
