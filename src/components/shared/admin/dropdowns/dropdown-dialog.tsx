"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/types/dropdowns/dropdown";
import { DropdownService } from "@/lib/services/dropdown.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Form schema with conditional validation for key field
const formSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    nameFr: z.string().nullable().optional(),
    nameMg: z.string().nullable().optional(),
    key: z.string().nullable().optional(),
    isParent: z.boolean().default(false),
    parentId: z.string().nullable().optional(),
    isEnabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Key is required if the dropdown is a parent
      if (data.isParent && (!data.key || data.key.trim() === "")) {
        return false;
      }
      return true;
    },
    {
      message: "Key is required for parent categories",
      path: ["key"],
    },
  );

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

  // Fetch parent dropdowns for the select field
  const { data: parentDropdowns = [] } = useQuery({
    queryKey: ["parentDropdowns"],
    queryFn: async () => {
      const response = await DropdownService.getParentDropdowns(true);
      return response.data;
    },
    enabled: open, // Only fetch when dialog is open
  });

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      nameFr: null,
      nameMg: null,
      key: null,
      isParent: false,
      parentId: null,
      isEnabled: true,
    },
  });

  // Handle parent dropdown selection logic
  const isParentValue = form.watch("isParent");

  // Reset form and populate with dropdown data if editing
  useEffect(() => {
    if (open) {
      if (dropdown) {
        form.reset({
          name: dropdown.name,
          nameFr: dropdown.nameFr || null,
          nameMg: dropdown.nameMg || null,
          key: dropdown.key || null,
          isParent: dropdown.isParent,
          parentId: dropdown.parentId || null,
          isEnabled: dropdown.isEnabled,
        });
      } else {
        form.reset({
          name: "",
          nameFr: null,
          nameMg: null,
          key: null,
          isParent: false,
          parentId: null,
          isEnabled: true,
        });
      }
    }
  }, [open, dropdown, form]);

  // Clear parentId when isParent is set to true
  useEffect(() => {
    if (isParentValue) {
      form.setValue("parentId", null);
    }
  }, [isParentValue, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);

      // Transform empty strings to null for optional fields
      const formattedData = {
        ...data,
        nameFr: data.nameFr?.trim() === "" ? null : data.nameFr,
        nameMg: data.nameMg?.trim() === "" ? null : data.nameMg,
        key: data.isParent ? data.key?.trim() || null : null, // Only use key for parent dropdowns
        // If it's a parent, ensure parentId is null
        parentId: data.isParent ? null : data.parentId,
      };

      await onSave(formattedData);
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
            {/* Base name (English) */}
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

            {/* French name */}
            <FormField
              control={form.control}
              name="nameFr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.nameFr")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.nameFrPlaceholder")}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Malagasy name */}
            <FormField
              control={form.control}
              name="nameMg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.nameMg")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.nameMgPlaceholder")}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Parent switch */}
            <FormField
              control={form.control}
              name="isParent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t("form.isParent")}</FormLabel>
                    <FormDescription>
                      {t("form.isParentDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Key field (only visible when isParent is true) */}
            {isParentValue && (
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.key")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.keyPlaceholder")}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("form.keyDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Parent dropdown selector (only visible when isParent is false) */}
            {!isParentValue && (
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.parentCategory")}</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("form.parentCategoryPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentDropdowns.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Enabled status */}
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t("form.isEnabled")}</FormLabel>
                    <FormDescription>
                      {t("form.isEnabledDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
