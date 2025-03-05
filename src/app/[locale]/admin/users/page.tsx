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
import { Badge } from "@/components/ui/badge";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { User } from "@/types/users/user";
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

export default function UsersPage() {
  const t = useTranslations("admin.users");
  const { getLocalizedName } = useLocalizedName();

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
  } = useUsersManagement();

  // Function to get localized territory name using our new hook
  const getTerritoryName = (user: User) => {
    if (!user.territory) return "-";
    const { name } = getLocalizedName(user.territory);
    return name;
  };

  // Function to get localized function names
  const getFunctionNames = (user: User) => {
    if (!user.functions?.length) return [t("common.none")];
    return user.functions.map((func) => {
      const { name } = getLocalizedName(func);
      return name;
    });
  };

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
      <div className="space-y-4 p-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
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
          <p className="text-muted-foreground">{t("description")}</p>
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
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button onClick={handleAdd} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              {t("addUser")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Search filter */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t("search.placeholder")}
              onChange={(e) => handleSearchChange(e.target.value)}
              value={tempSearchQuery}
            />
          </div>

          {/* Role filter */}
          <div className="w-[200px]">
            <Select
              value={tempRoleFilter}
              onValueChange={(value: "all" | "admin" | "user") =>
                handleRoleFilterChange(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("filter.byRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filter.all")}</SelectItem>
                <SelectItem value="admin">{t("filter.admin")}</SelectItem>
                <SelectItem value="user">{t("filter.user")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Territory filter */}
          <div className="w-[200px]">
            <DropdownSelect
              dropdownKey="territory"
              value={tempTerritoryFilter}
              onChange={(value) => handleTerritoryFilterChange(value as string)}
              placeholder={t("filter.byTerritory")}
            />
          </div>

          {/* Apply/Clear filters */}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={applyFilters} size="sm">
              <Search className="mr-2 h-4 w-4" />
              {t("filter.apply")}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  size="sm"
                  disabled={
                    !searchQuery &&
                    roleFilter === "all" &&
                    !territoryFilter &&
                    sortConfig.field === "name" &&
                    sortConfig.direction === "asc"
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("search.clearFilters")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? t("noSearchResults.description")
                : t("noUsers.description")}
            </p>
            {!searchQuery && (
              <Button onClick={handleAdd} className="mt-4">
                <UserPlus className="mr-2 h-4 w-4" />
                {t("addUser")}
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("name")}
                    className="cursor-pointer"
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
                    onClick={() => handleSort("email")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      {t("table.email")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "email"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("phone")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      {t("table.phone")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "phone"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("role")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      {t("table.role")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "role"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      {t("table.functions")}
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("territory")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      {t("table.territory")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "territory"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("gender")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      {t("table.gender")}
                      <ArrowUpDown
                        className={`ml-2 h-4 w-4 ${
                          sortConfig.field === "gender"
                            ? "opacity-100"
                            : "opacity-40"
                        }`}
                      />
                    </div>
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("createdAt")}
                    className="cursor-pointer"
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      {user.email}
                    </TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          user.role === "admin"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getFunctionNames(user).map((funcName, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {funcName}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getTerritoryName(user)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.gender ? t(`form.${user.gender}`) : "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "PPp")}
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
                                  aria-label={t("actions.more")}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("actions.more")}</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
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
                      </div>
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
