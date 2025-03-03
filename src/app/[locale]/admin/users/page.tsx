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
  UserPlus,
  AlertCircle,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { UserDialog } from "@/components/shared/admin/users/user-dialog";
import { format } from "date-fns";
import { useUsersManagement } from "@/hooks/admin/useUsersManagement";
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

export default function UsersPage() {
  const t = useTranslations("admin.users");
  const {
    users,
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
    handleSort,
    handleClearFilters,
    handleEdit,
    handleDelete,
    handleAdd,
    handleDialogClose,
    handleSaveUser,
  } = useUsersManagement();

  const showDeleteConfirmation = (userId: string) => {
    const { confirmDelete } = handleDelete(userId);

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
                toast.dismiss();
                confirmDelete();
              }}
            >
              {t("dialog.confirm")}
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <div className="p-1">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </Card>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("error.title")}</AlertTitle>
        <AlertDescription>{t("error.description")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          {t("addUser")}
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search.placeholder")}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
                value={tempSearchQuery}
              />
            </div>
            <Select
              value={tempRoleFilter}
              onValueChange={(value: "all" | "admin" | "user") =>
                handleRoleFilterChange(value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filter.byRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                <SelectItem value="admin">{t("filter.admin")}</SelectItem>
                <SelectItem value="user">{t("filter.user")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={applyFilters} className="shrink-0">
              {t("filter.apply")}
            </Button>
            {(searchQuery ||
              roleFilter !== "all" ||
              sortConfig.field !== "name" ||
              sortConfig.direction !== "asc") && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t("search.clearFilters")}</span>
              </Button>
            )}
          </div>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? t("noSearchResults.title") : t("noUsers.title")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? t("noSearchResults.description")
                : t("noUsers.description")}
            </p>
            {!searchQuery && (
              <Button onClick={handleAdd}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t("addUser")}
              </Button>
            )}
          </div>
        ) : (
          <div className="min-w-[600px] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("name")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {t("table.name")}
                      <ArrowUpDown className="h-4 w-4" />
                      {sortConfig.field === "name" && (
                        <span className="sr-only">
                          {sortConfig.direction === "asc"
                            ? t("table.sortAsc")
                            : t("table.sortDesc")}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("email")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {t("table.email")}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("role")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {t("table.role")}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("createdAt")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-1">
                      {t("table.createdAt")}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[48px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "PPp")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">
                                  {t("actions.more")}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>{t("actions.more")}</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            {t("actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => showDeleteConfirmation(user.id)}
                          >
                            {t("actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <UserDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        user={selectedUser || undefined}
        onSave={handleSaveUser}
      />
    </div>
  );
}
