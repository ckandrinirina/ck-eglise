/**
 * @component TransactionsList
 * @description Component for displaying and managing transactions
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, FileDown, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionForm from "./transaction-form";
import { useTransactions } from "@/hooks/finance/useTransactions";

/**
 * TransactionsList component for displaying and managing transactions
 */
const TransactionsList = () => {
  const t = useTranslations("finance");
  const { transactions, isLoading, filterTransactions, filter, formatAmount } =
    useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.reason.toLowerCase().includes(searchLower) ||
      (transaction.userName &&
        transaction.userName.toLowerCase().includes(searchLower)) ||
      formatAmount(transaction.amount).includes(searchTerm)
    );
  });

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: fr });
  };

  // Handle export to CSV
  const handleExport = () => {
    const headers = ["Date", "Montant", "Type", "Utilisateur", "Raison"];

    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((transaction) =>
        [
          formatDate(transaction.createdAt),
          transaction.amount,
          transaction.type === "credit" ? t("credit") : t("debit"),
          transaction.userName || t("unknown"),
          `"${transaction.reason.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `transactions-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
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
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {t("filter")}
                  {filter && (
                    <Badge variant="secondary" className="ml-2">
                      {filter}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuLabel>{t("filterBy")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => filterTransactions(null)}>
                    {t("all")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => filterTransactions("credit")}
                  >
                    {t("credit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => filterTransactions("debit")}>
                    {t("debit")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead className="w-[300px]">{t("reason")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  // No results message
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm ? t("noSearchResults") : t("noTransactions")}
                    </TableCell>
                  </TableRow>
                ) : (
                  // Transaction data
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="font-medium">
                        {formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === "credit"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {transaction.type === "credit"
                            ? t("credit")
                            : t("debit")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.userName || t("unknown")}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
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
