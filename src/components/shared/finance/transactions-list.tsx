/**
 * @component TransactionsList
 * @description Component for displaying and managing transactions
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, Filter, X, FileDown } from "lucide-react";
import { useTransactions } from "@/hooks/finance/useTransactions";
import TransactionForm from "@/components/shared/finance/transaction-form";
import UserSelect from "@/components/shared/common/user-select";
import { DropdownSelect } from "@/components/shared/common/dropdown-select";
import { SiteBalance } from "@/components/shared/finance/site-balance";
import { TransactionSummary } from "@/components/shared/finance/transaction-summary";
import { DateRangeFilter } from "@/components/shared/finance/date-range-filter";

/**
 * TransactionsList component for displaying and managing transactions
 */
const TransactionsList = () => {
  const t = useTranslations("finance");
  const {
    transactions,
    isLoading,
    filterTransactions,
    filterByDateRange,
    clearFilters,
    filter,
    transactionTypeFilter,
    dateRange,
  } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions based on search term and user filter
  const filteredTransactions = transactions.filter((transaction) => {
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        transaction.reason.toLowerCase().includes(searchLower) ||
        (transaction.userName &&
          transaction.userName.toLowerCase().includes(searchLower)) ||
        transaction.amount.toString().includes(searchTerm) ||
        (transaction.transactionTypeName &&
          transaction.transactionTypeName.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    // Apply user filter
    if (userFilter && transaction.userId !== userFilter) {
      return false;
    }

    return true;
  });

  // Count active filters
  const activeFiltersCount = [
    filter,
    transactionTypeFilter,
    userFilter,
    dateRange.startDate,
    dateRange.endDate,
  ].filter(Boolean).length;

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    setUserFilter(null);
    setSearchTerm("");
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: fr });
  };

  // Handle export function
  const handleExport = () => {
    console.log("Export functionality to be implemented");
    // Implementation would go here
  };

  // Handle user filter change
  const handleUserFilterChange = (value: string | null) => {
    setUserFilter(value);
  };

  // Handle transaction type filter change
  const handleTransactionTypeChange = (value: string | null) => {
    filterTransactions(filter, value);
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <SiteBalance />
        </div>
        <div>
          <TransactionSummary
            startDate={dateRange.startDate || undefined}
            endDate={dateRange.endDate || undefined}
          />
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>{t("transactions")}</CardTitle>
            <CardDescription>{t("transactionsDescription")}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleExport} variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              {t("export")}
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("addTransaction")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("searchTransactions")}
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {t("filter")}
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t("clearFilters")}
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("filterByType")}
                    </label>
                    <DropdownSelect
                      dropdownKey="transaction-type"
                      value={transactionTypeFilter || ""}
                      onChange={handleTransactionTypeChange}
                      placeholder={t("allTypes")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("filterByUser")}
                    </label>
                    <UserSelect
                      value={userFilter || ""}
                      onChange={handleUserFilterChange}
                      placeholder={t("allUsers")}
                    />
                  </div>
                </div>

                <DateRangeFilter
                  onFilterChange={filterByDateRange}
                  initialStartDate={dateRange.startDate}
                  initialEndDate={dateRange.endDate}
                />
              </div>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead className="text-right">{t("credit")}</TableHead>
                  <TableHead className="text-right">{t("debit")}</TableHead>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("transactionType")}</TableHead>
                  <TableHead className="w-[250px]">{t("reason")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-6 w-full bg-gray-200 animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  // No results message
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {searchTerm ||
                      filter ||
                      transactionTypeFilter ||
                      userFilter ||
                      dateRange.startDate ||
                      dateRange.endDate
                        ? t("noSearchResults")
                        : t("noTransactions")}
                    </TableCell>
                  </TableRow>
                ) : (
                  // Transaction data
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="font-medium text-right">
                        {transaction.type === "credit" ? (
                          <span className="text-green-600">
                            {formatAmount(transaction.amount)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        {transaction.type === "debit" ? (
                          <span className="text-red-600">
                            {formatAmount(transaction.amount)}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {transaction.userName || t("unknown")}
                      </TableCell>
                      <TableCell>
                        {transaction.transactionTypeName || t("notSpecified")}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate">
                        {transaction.reason}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
};

export default TransactionsList;
