/**
 * @component TransactionForm
 * @description Form component for creating new transactions
 */

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionForm } from "@/hooks/finance/useTransactionForm";
import { useFinanceRefresh } from "@/hooks/finance/useFinanceRefresh";
import UserSelect from "@/components/shared/common/user-select";
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

interface TransactionFormData {
  type: "credit" | "debit";
  senderId?: string | null;
  receiverId?: string | null;
  amount: number;
  reason?: string | null;
  transactionTypeId?: string | null;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialUserId?: string;
  initialDirection?: "from" | "to";
}

/**
 * Transaction form component for creating new transactions
 */
const TransactionForm = ({
  isOpen,
  onClose,
  initialUserId,
  initialDirection,
}: TransactionFormProps) => {
  const t = useTranslations("finance");
  const { refreshFinanceData } = useFinanceRefresh();

  const handleSuccess = () => {
    refreshFinanceData();
    onClose();
  };

  const { form, onSubmit, isPending } = useTransactionForm(
    handleSuccess,
    initialUserId,
    initialDirection,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addTransaction")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactionType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit">{t("credit")}</SelectItem>
                      <SelectItem value="debit">{t("debit")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <UserSelect<TransactionFormData>
              form={form}
              name="senderId"
              label={t("sender")}
              placeholder={t("selectSender")}
              required={false}
            />

            <UserSelect<TransactionFormData>
              form={form}
              name="receiverId"
              label={t("receiver")}
              placeholder={t("selectReceiver")}
              required={false}
            />

            <FormField
              control={form.control}
              name="transactionTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactionType")}</FormLabel>
                  <FormControl>
                    <DropdownSelect
                      dropdownKey="transaction-type"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      placeholder={t("selectTransactionType")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reason")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={3}
                      placeholder={t("enterReason")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("creating") : t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
