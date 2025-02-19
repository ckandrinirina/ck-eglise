# Translation Feature

## Overview
The application supports multilingual content with three primary languages:
- French (fr)
- Malagasy (mg)
- English (en)

## Implementation Details

### Language Selection
- Users can switch between French (fr), Malagasy (mg), and English (en) languages
- Language preference is persisted across sessions
- Default language is French (fr)

### Technical Stack
- Uses next-i18next library for internationalization
- Integrates seamlessly with Next.js App Router
- Supports server-side and client-side translations
- JSON-based translation files

### Supported Content
- UI elements
- Static content
- Dynamic content
- Form labels and messages
- Error messages

### Technical Implementation
- Language switching is available on all pages
- Translation strings are managed through next-i18next configuration
- Translation files organized in public/locales/{lang} directory
- Real-time language switching without page reload
- SEO-friendly URL structure with language prefixes

### User Experience
- Language selector is accessible from the navigation
- Clear visual indication of current language
- Smooth transition between languages
- Maintains user's language preference

## Future Enhancements
- Additional language support if needed
- Language-specific content optimization
- Automated translation workflow