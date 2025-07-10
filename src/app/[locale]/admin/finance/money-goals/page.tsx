/**
 * Money Goals management page
 *
 * @page MoneyGoalsPage
 * @description Admin page for managing money goals with filtering and totals
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { MoneyGoalFilters } from "@/types/money-goals";
import { useMoneyGoals } from "@/hooks/money-goals/useMoneyGoals";
import { MoneyGoalFormModal } from "@/components/shared/admin/money-goals/money-goal-form-modal";
import { MoneyGoalDeleteDialog } from "@/components/shared/admin/money-goals/money-goal-delete-dialog";
import { MoneyGoalSummaryCards } from "@/components/shared/admin/money-goals/money-goal-summary-cards";
import { MoneyGoalService } from "@/lib/services/money-goal.service";
import { MoneyGoalCategoryService } from "@/lib/services/money-goal-category.service";
import { PDFExportService } from "@/lib/services/pdf-export.service";

export default function MoneyGoalsPage() {
  const t = useTranslations("admin.money_goals");

  // Applied filters (used for API calls)
  const [appliedFilters, setAppliedFilters] = useState<MoneyGoalFilters>({
    years: new Date().getFullYear(),
    status: undefined,
    search: "",
    categoryId: undefined,
  });

  // Pending filters (form state)
  const [pendingFilters, setPendingFilters] = useState<MoneyGoalFilters>({
    years: new Date().getFullYear(),
    status: undefined,
    search: "",
    categoryId: undefined,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const { data: goals, isLoading, error } = useMoneyGoals(appliedFilters);

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ["money-goal-categories"],
    queryFn: () => MoneyGoalCategoryService.getCategories(),
  });

  const handleFilterChange = (
    key: keyof MoneyGoalFilters,
    value: string | number | undefined,
  ) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      years: new Date().getFullYear(),
      status: undefined,
      search: "",
      categoryId: undefined,
    };
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const handleEditGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsFormModalOpen(true);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId);
    setIsDeleteDialogOpen(true);
  };

  const handleExportPDF = async () => {
    try {
      const exportData = await MoneyGoalService.exportToPdf(appliedFilters);
      await PDFExportService.exportMoneyGoalsToPDF(exportData);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {t("status.active")}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {t("status.completed")}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="default" className="bg-red-100 text-red-800">
            {t("status.cancelled")}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {t("actions.export_pdf")}
          </Button>
          <Button
            onClick={() => {
              setSelectedGoalId(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("actions.create")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <MoneyGoalSummaryCards filters={appliedFilters} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>{t("filters.search")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("filters.search_placeholder")}
                  value={pendingFilters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>{t("filters.year")}</Label>
              <Select
                value={pendingFilters.years?.toString()}
                onValueChange={(value) =>
                  handleFilterChange("years", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filters.year_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("filters.status")}</Label>
              <Select
                value={pendingFilters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "all" ? undefined : value,
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
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="completed">
                    {t("status.completed")}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {t("status.cancelled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("filters.category")}</Label>
              <Select
                value={pendingFilters.categoryId || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "categoryId",
                    value === "all" ? undefined : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("filters.category_placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filters.all_categories")}
                  </SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {category.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        {category.nameFr || category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={resetFilters}>
                {t("filters.reset")}
              </Button>
              <Button onClick={applyFilters}>{t("filters.apply")}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Table */}
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
          ) : !goals?.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">{t("list.no_goals")}</div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.name")}</TableHead>
                    <TableHead>{t("table.category")}</TableHead>
                    <TableHead>{t("table.target_amount")}</TableHead>
                    <TableHead>{t("table.reached_amount")}</TableHead>
                    <TableHead>{t("table.progress")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.year")}</TableHead>
                    <TableHead>{t("table.creator")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {goal.category?.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: goal.category.color }}
                            />
                          )}
                          <span>
                            {goal.category?.nameFr || goal.category?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(goal.amountGoal)}</TableCell>
                      <TableCell>{formatCurrency(goal.reachedGoal)}</TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="space-y-1">
                          <Progress
                            value={goal.progressPercentage}
                            className="h-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            {goal.progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell>{goal.years}</TableCell>
                      <TableCell>
                        {goal.creator.name || goal.creator.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal.id)}
                          >
                            {t("actions.edit")}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            {t("actions.delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{t("totals.title")}</span>
                  <div className="flex items-center gap-6">
                    <span>
                      {t("totals.total_target")}:{" "}
                      {formatCurrency(
                        goals.reduce((sum, goal) => sum + goal.amountGoal, 0),
                      )}
                    </span>
                    <span>
                      {t("totals.total_reached")}:{" "}
                      {formatCurrency(
                        goals.reduce((sum, goal) => sum + goal.reachedGoal, 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <MoneyGoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedGoalId(null);
        }}
        goalId={selectedGoalId}
      />

      <MoneyGoalDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setGoalToDelete(null);
        }}
        goalId={goalToDelete}
      />
    </div>
  );
}
