"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/types/dropdowns/dropdown";

// Form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  type: z.string().min(1, { message: "Type is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface DropdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dropdown?: Dropdown;
  onSave: (data: FormValues) => void;
}

export const DropdownDialog = ({
  open,
  onOpenChange,
  dropdown,
  onSave,
}: DropdownDialogProps) => {
  const t = useTranslations("admin.dropdowns");
  const [isPending, setIsPending] = useState(false);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  // Reset form and populate with dropdown data if editing
  useEffect(() => {
    if (open) {
      if (dropdown) {
        form.reset({
          name: dropdown.name,
          type: dropdown.type,
        });
      } else {
        form.reset({
          name: "",
          type: "",
        });
      }
    }
  }, [open, dropdown, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);
      await onSave(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dropdown ? t("dialog.editDropdown") : t("dialog.addDropdown")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.namePlaceholder")} {...field} />
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
                  <FormLabel>{t("form.type")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.typePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("dialog.cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("dialog.saving") : t("dialog.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
