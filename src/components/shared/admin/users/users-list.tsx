"use client";

import { useState } from "react";
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
  UserPlus,
  AlertCircle,
  Search,
  X,
  ArrowUpDown,
  CreditCard,
  Pencil,
  Trash,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { useUsersManagement } from "@/hooks/admin/useUsersManagement";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalizedName } from "@/hooks/common/useLocalizedName";
import { DropdownSelect } from "@/components/shared/common/dropdown-select";
import { User } from "@/types/users/user";
import { UserDialog } from "@/components/shared/admin/users/user-dialog";
import TransactionForm from "@/components/shared/finance/transaction-form";

/**
 * UsersList component for displaying and managing users
 */
const UsersList = () => {
  const t = useTranslations("admin.users");
  const { getLocalizedName } = useLocalizedName();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedUserForTransaction, setSelectedUserForTransaction] = useState<
    string | null
  >(null);
  const [transactionDirection, setTransactionDirection] = useState<
    "from" | "to" | null
  >(null);

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
    functionFilter,
    tempFunctionFilter,
    sortConfig,
    handleSearchChange,
    handleRoleFilterChange,
    handleTerritoryFilterChange,
    handleFunctionFilterChange,
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

  const handleMakeTransaction = (user: User, direction: "from" | "to") => {
    setSelectedUserForTransaction(user.id);
    setTransactionDirection(direction);
    setTransactionDialogOpen(true);
  };

  const handleTransactionDialogClose = () => {
    setTransactionDialogOpen(false);
    setSelectedUserForTransaction(null);
    setTransactionDirection(null);
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

  return (
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

        {/* Function filter */}
        <div className="w-[200px]">
          <DropdownSelect
            dropdownKey="function"
            value={tempFunctionFilter}
            onChange={(value) => handleFunctionFilterChange(value as string)}
            placeholder={t("filter.byFunction")}
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
                  !functionFilter &&
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
                      {getFunctionNames(user).length <= 2 ? (
                        // If 2 or fewer functions, display all of them
                        getFunctionNames(user).map((funcName, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {funcName}
                          </Badge>
                        ))
                      ) : (
                        // If more than 2 functions, display first 2 + "more" badge with tooltip
                        <>
                          {getFunctionNames(user)
                            .slice(0, 2)
                            .map((funcName, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {funcName}
                              </Badge>
                            ))}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-xs cursor-pointer"
                              >
                                +{getFunctionNames(user).length - 2}{" "}
                                {t("table.more")}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="flex flex-col gap-1 p-1">
                                {getFunctionNames(user).map(
                                  (funcName, index) => (
                                    <span key={index} className="text-xs">
                                      {funcName}
                                    </span>
                                  ),
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
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
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMakeTransaction(user, "from")}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            {t("actions.transactionFrom")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMakeTransaction(user, "to")}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            {t("actions.transactionTo")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => showDeleteConfirmation(user.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
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

      <UserDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        user={selectedUser || undefined}
        onSave={handleSaveUser}
      />

      {/* Transaction Dialog */}
      {transactionDialogOpen && (
        <TransactionForm
          isOpen={transactionDialogOpen}
          onClose={handleTransactionDialogClose}
          initialUserId={selectedUserForTransaction || undefined}
          initialDirection={transactionDirection || undefined}
        />
      )}
    </Card>
  );
};

export default UsersList;
