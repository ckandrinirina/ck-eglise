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

export default function DropdownsPage() {
  const t = useTranslations("admin.dropdowns");
  const {
    dropdowns,
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
  } = useDropdownsManagement();

  const showDeleteConfirmation = (dropdownId: string) => {
    const { confirmDelete } = handleDelete(dropdownId);

    toast.custom(
      () => (
        <div className="rounded-lg bg-background p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-medium">{t("dialog.confirmDelete")}</h3>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => toast.dismiss()}>
              {t("dialog.cancel")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                confirmDelete();
                toast.dismiss();
              }}
            >
              {t("dialog.delete")}
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

  return (
    <div className="space-y-4 p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

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
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t("filters.searchPlaceholder")}
              value={tempSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-[200px]">
            <Select
              value={tempTypeFilter}
              onValueChange={handleTypeFilterChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filters.typeAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.typeAll")}</SelectItem>
                {dropdownTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`form.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={applyFilters} size="sm">
              <Search className="mr-2 h-4 w-4" />
              {t("filters.apply")}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              size="sm"
              disabled={!searchQuery && typeFilter === "all"}
            >
              <X className="mr-2 h-4 w-4" />
              {t("filters.clear")}
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
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center">
                      {t("table.type")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "type"
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
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dropdowns.map((dropdown) => (
                  <TableRow key={dropdown.id}>
                    <TableCell>{dropdown.name}</TableCell>
                    <TableCell>{t(`form.types.${dropdown.type}`)}</TableCell>
                    <TableCell>
                      {format(new Date(dropdown.createdAt), "PPP")}
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
                              className="text-destructive"
                              onClick={() =>
                                showDeleteConfirmation(dropdown.id)
                              }
                            >
                              {t("buttons.delete")}
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
