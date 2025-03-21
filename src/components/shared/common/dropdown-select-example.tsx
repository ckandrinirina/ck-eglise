"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DropdownSelect } from "./dropdown-select";
import { DropdownSelectMultiple } from "./dropdown-select-multiple";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Form schema definition
const formSchema = z.object({
  territory: z.string().min(1, "Please select a territory"),
  branches: z.array(z.string()).min(1, "Please select at least one branch"),
  departments: z
    .array(z.string())
    .min(1, "Please select at least one department"),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Example component showing how to use DropdownSelect and DropdownSelectMultiple with and without React Hook Form
 *
 * @component
 * @example
 * <DropdownSelectExample />
 */
export const DropdownSelectExample = () => {
  // For standalone usage
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // For React Hook Form integration
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      territory: "",
      branches: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data);
    alert(`Form submitted successfully:\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Dropdown Select Examples</h1>

      {/* Standalone Examples */}
      <Card className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">Standalone Usage</h2>

        {/* Single select example */}
        <div>
          <h3 className="font-medium mb-2">Single Selection</h3>
          <DropdownSelect
            dropdownKey="territory" // Assuming you have a dropdown with key "territory"
            label="Select Territory"
            description="Choose a territory from the dropdown"
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            required
          />
          <div className="mt-2 text-sm">
            Selected value: {selectedRole || "(none)"}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Multiple select example */}
        <div>
          <h3 className="font-medium mb-2">Multiple Selection</h3>
          <DropdownSelectMultiple
            dropdownKey="territory" // Assuming you have a dropdown with key "territory"
            label="Select Multiple Territories"
            description="Choose multiple territories from the dropdown"
            value={selectedRoles}
            onChange={(values) => setSelectedRoles(values)}
            required
            maxDisplay={2}
            badgeVariant="secondary"
          />
          <div className="mt-2 text-sm">
            Selected values:{" "}
            {selectedRoles.length ? selectedRoles.join(", ") : "(none)"}
          </div>
        </div>
      </Card>

      {/* React Hook Form Example */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          React Hook Form Integration
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Single select with React Hook Form */}
            <FormField
              control={form.control}
              name="territory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Territory</FormLabel>
                  <FormControl>
                    <DropdownSelect
                      dropdownKey="territory" // Assuming you have a dropdown with key "territory"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      error={form.formState.errors.territory?.message}
                    />
                  </FormControl>
                  <FormDescription>
                    Select the territory for this record
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multiple select with React Hook Form */}
            <FormField
              control={form.control}
              name="branches"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branches</FormLabel>
                  <FormControl>
                    <DropdownSelectMultiple
                      dropdownKey="territory" // Assuming you have a dropdown with key "branch"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      error={form.formState.errors.branches?.message}
                    />
                  </FormControl>
                  <FormDescription>Select one or more branches</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multiple select with React Hook Form - Additional styling options */}
            <FormField
              control={form.control}
              name="departments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departments</FormLabel>
                  <FormControl>
                    <DropdownSelectMultiple
                      dropdownKey="territory" // Assuming you have a dropdown with key "department"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      error={form.formState.errors.departments?.message}
                      maxDisplay={3}
                      badgeVariant="default"
                    />
                  </FormControl>
                  <FormDescription>
                    Select one or more departments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-4">
              Submit Form
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};
