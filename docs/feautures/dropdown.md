# Dropdown Select Components

Our application features reusable dropdown selection components that provide both single and multiple selection capabilities, fetch options from server-side dropdowns by key, and integrate seamlessly with React Hook Form.

## Components

- **DropdownSelect**: For single value selection scenarios only
- **DropdownSelectMultiple**: Dedicated component for multiple value selection scenarios

## Features

- Dynamic dropdown options loading from the server
- Clear separation of concerns between single and multiple selection
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
// Use DropdownSelectMultiple component for multiple selection
import { DropdownSelectMultiple } from "@/components/shared/common/dropdown-select-multiple";

<DropdownSelectMultiple 
  dropdownKey="branch" 
  label="Select Branches"
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
import { DropdownSelectMultiple } from "@/components/shared/common/dropdown-select-multiple";

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
            <DropdownSelectMultiple
              dropdownKey="branch"
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
  </form>
</Form>
```

## Props Reference

### DropdownSelect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dropdownKey` | `string` | required | The key of the parent dropdown to fetch items for |
| `value` | `string \| null \| undefined` | `undefined` | The currently selected value |
| `onChange` | `(value: string) => void` | `undefined` | Callback triggered when selection changes |
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

### DropdownSelectMultiple Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dropdownKey` | `string` | required | The key of the parent dropdown to fetch items for |
| `value` | `string[]` | `[]` | The currently selected values |
| `onChange` | `(value: string[]) => void` | `undefined` | Callback triggered when selection changes |
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

The components use the following internal logic:

1. Fetches dropdown options using `DropdownService` based on the provided key
2. Supports both controlled and uncontrolled usage
3. Shows loading states while options are being fetched
4. Supports locale-based option text (en, fr, mg)
5. Uses shadcn/ui components for consistent styling
6. Provides accessible keyboard navigation
7. Implements React Hook Form compatibility
8. DropdownSelectMultiple shows badges for selections with removal capability

## Component Architecture

- **DropdownSelect**: Focused exclusively on single value selection with a clean, simple interface
- **DropdownSelectMultiple**: Dedicated to multiple value selection scenarios with optimized UX for managing multiple selections

## Best Practices

1. For single selection, use `DropdownSelect`
2. For multiple selection, use `DropdownSelectMultiple` 
3. Always provide a specific `dropdownKey` that matches a parent dropdown in the database
4. Handle the returned value appropriately - string for single selection, string[] for multiple selection
5. Add proper validation in your form schema for required fields
6. Consider accessibility by providing clear labels and error messages