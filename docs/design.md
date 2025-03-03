# Design Guidelines

## Component Architecture
- All UI components must use shadcn/ui
- Import components from @/components/ui
- Complex shared components go in @/components/shared

## Layout Structure
- Use authenticated layout for protected routes
- Use authentication layout for login/signup flows
- Maintain consistent page padding and spacing

## UI Components
### Button Usage
- Use shadcn/ui Button component for all clickable actions
- Maintain consistent button sizes and styles
- Follow shadcn/ui button variants for different contexts

### Form Elements
- Use shadcn/ui form components
- Maintain consistent input field sizes
- Follow form validation patterns

## Visual Guidelines
### Colors
- Use Tailwind CSS color classes
- Follow the project's color palette
- Maintain consistent color usage for similar elements

### Typography
- Use Tailwind CSS typography classes
- Maintain consistent heading hierarchies
- Follow the established font scale

## Responsive Design
- Design mobile-first
- Use Tailwind's responsive breakpoints
- Ensure consistent component behavior across devices

## Accessibility
- Maintain proper color contrast
- Include proper ARIA labels
- Ensure keyboard navigation works correctly
- Support screen readers