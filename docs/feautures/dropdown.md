# Dropdown Select Component

Our application features a reusable DropdownSelect component that provides both single and multiple selection capabilities, fetches options from server-side dropdowns by key, and integrates seamlessly with React Hook Form.

## Features

- Dynamic dropdown options loading from the server
- Both single-select and multi-select modes
- Full React Hook Form compatibility
- Internationalization support (en, fr, mg)
- Accessibility features
- Loading states and error handling
- Customizable placeholders and labels

## Usage Examples

### Basic Single Selection

```tsx
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

// Simple standalone usage
<DropdownSelect 
  dropdownKey="territory" 
  label="Select Territory"
  value={selectedValue} 
  onChange={(value) => setSelectedValue(value)} 
/>
```

### Multiple Selection

```tsx
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

// Multiple selection mode
<DropdownSelect 
  dropdownKey="branch" 
  label="Select Branches"
  isMultiple 
  value={selectedValues} 
  onChange={(values) => setSelectedValues(values)} 
/>
```

### Integration with React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { DropdownSelect } from "@/components/shared/common/dropdown-select";

// Form schema definition
const formSchema = z.object({
  territory: z.string().min(1, "Please select a territory"),
  branches: z.array(z.string()).min(1, "Please select at least one branch"),
});

type FormValues = z.infer<typeof formSchema>;

// React Hook Form integration
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    territory: "",
    branches: [],
  },
});

// In your component's JSX
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* Single select with React Hook Form */}
    <FormField
      control={form.control}
      name="territory"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Territory</FormLabel>
          <FormControl>
            <DropdownSelect
              dropdownKey="territory"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormControl>
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
            <DropdownSelect
              dropdownKey="branch"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              isMultiple
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dropdownKey` | `string` | required | The key of the parent dropdown to fetch items for |
| `value` | `string \| string[]` | `undefined` | The currently selected value(s) |
| `onChange` | `(value: string \| string[]) => void` | `undefined` | Callback triggered when selection changes |
| `isMultiple` | `boolean` | `false` | Enable multiple selection mode |
| `placeholder` | `string` | `"Select..."` | Placeholder text when no selection is made |
| `className` | `string` | `undefined` | Additional CSS classes |
| `label` | `string` | `undefined` | Label for the dropdown |
| `description` | `string` | `undefined` | Description text below the dropdown |
| `error` | `string` | `undefined` | Error message to display |
| `disabled` | `boolean` | `false` | Disable the dropdown |
| `includeDisabled` | `boolean` | `false` | Include disabled dropdown items in options |
| `required` | `boolean` | `false` | Mark the field as required |
| `name` | `string` | `undefined` | Name attribute for the input (for forms) |
| `onBlur` | `() => void` | `undefined` | Callback triggered on field blur |

## Implementation Details

The component uses the following internal logic:

1. Fetches dropdown options using `DropdownService` based on the provided key
2. Supports both controlled and uncontrolled usage
3. Shows loading states while options are being fetched
4. Supports locale-based option text (en, fr, mg)
5. Uses shadcn/ui components for consistent styling
6. Provides accessible keyboard navigation
7. Implements React Hook Form compatibility
8. Shows badges for multiple selections with removal capability

## Best Practices

1. Always provide a specific `dropdownKey` that matches a parent dropdown in the database
2. Use the `isMultiple` prop when multiple selections are needed
3. Handle the returned value appropriately - string for single selection, string[] for multiple selection
4. Add proper validation in your form schema for required fields
5. Consider accessibility by providing clear labels and error messages