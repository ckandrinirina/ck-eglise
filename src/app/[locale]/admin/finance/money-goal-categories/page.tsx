/**
 * Money Goal Categories management page
 *
 * @page MoneyGoalCategoriesPage
 * @description Admin page for managing money goal categories
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoneyGoalCategoryService } from "@/lib/services/money-goal-category.service";
import { MoneyGoalCategoryFormModal } from "@/components/shared/admin/money-goals/money-goal-category-form-modal";
import { MoneyGoalCategoryDeleteDialog } from "@/components/shared/admin/money-goals/money-goal-category-delete-dialog";

interface CategoryFilters {
  search: string;
  status: "all" | "enabled" | "disabled";
}

export default function MoneyGoalCategoriesPage() {
  const t = useTranslations("admin.money_goal_categories");
  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
    status: "all",
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["money-goal-categories", filters.status === "all"],
    queryFn: () =>
      MoneyGoalCategoryService.getCategories(filters.status === "all"),
  });

  const filteredCategories = categories?.filter((category) => {
    const matchesSearch =
      !filters.search ||
      category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      category.nameFr?.toLowerCase().includes(filters.search.toLowerCase()) ||
      category.nameMg?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "enabled" && category.isEnabled) ||
      (filters.status === "disabled" && !category.isEnabled);

    return matchesSearch && matchesStatus;
  });

  const handleFilterChange = (key: keyof CategoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsFormModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (isEnabled: boolean) => {
    return isEnabled ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        {t("status.enabled")}
      </Badge>
    ) : (
      <Badge variant="default" className="bg-red-100 text-red-800">
        {t("status.disabled")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategoryId(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("actions.create")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>{t("filters.search")}</Label>
              <Input
                placeholder={t("filters.search_placeholder")}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div>
              <Label>{t("filters.status")}</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value as CategoryFilters["status"],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.status_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.all_statuses")}
                  </SelectItem>
                  <SelectItem value="enabled">{t("status.enabled")}</SelectItem>
                  <SelectItem value="disabled">
                    {t("status.disabled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: "",
                    status: "all",
                  })
                }
              >
                {t("filters.reset")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("list.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t("list.loading")}</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-destructive">{t("list.error")}</div>
            </div>
          ) : !filteredCategories?.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">
                {t("list.no_categories")}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.translations")}</TableHead>
                  <TableHead>{t("table.color")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.goals_count")}</TableHead>
                  <TableHead>{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {category.color && (
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {category.nameFr && (
                          <div>
                            <span className="font-medium">FR:</span>{" "}
                            {category.nameFr}
                          </div>
                        )}
                        {category.nameMg && (
                          <div>
                            <span className="font-medium">MG:</span>{" "}
                            {category.nameMg}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {category.color}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(category.isEnabled)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {category.goals?.length || 0} {t("table.goals")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCategory(category.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={category.goals && category.goals.length > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <MoneyGoalCategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCategoryId(null);
        }}
        categoryId={selectedCategoryId}
      />

      <MoneyGoalCategoryDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        categoryId={categoryToDelete}
      />
    </div>
  );
}
