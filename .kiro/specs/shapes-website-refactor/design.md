# Design Document

## Overview

The SHAPES website refactor will transform the existing terminal-style React application into a modern, professional website that matches the provided HTML/CSS design. The new architecture will maintain React's component-based structure while implementing a clean, section-based layout with smooth navigation, responsive design, and interactive elements.

The design follows a single-page application (SPA) pattern with multiple sections that users can navigate through via a fixed header navigation. The visual design emphasizes minimalism, clean typography, and subtle interactions that enhance user experience without overwhelming the content.

## Architecture

### Component Hierarchy

```
App
├── Header
│   ├── Logo
│   └── Navigation
├── HeroSection
├── AboutSection
├── MethodSection
│   └── MethodCard (x3)
├── WorkshopsSection
│   └── WorkshopItem (x3)
├── VisionSection
│   └── VisionCard (x4)
├── WhySection
│   └── WhyItem (x4)
├── GetInvolvedSection
│   └── InvolvedCard (x3)
├── ContactSection
│   └── ContactForm
└── Footer
```

### State Management

The application will use React's built-in state management with hooks:

- **Form State**: `useState` for contact form data and validation
- **UI State**: `useState` for form submission status, loading states
- **Navigation State**: No additional state needed as navigation will use native scroll behavior with smooth scrolling

### Styling Architecture

The styling will be implemented using CSS modules to maintain component encapsulation while allowing for global design tokens:

- **Global Styles**: CSS custom properties (variables) for colors, typography, and spacing
- **Component Styles**: CSS modules for component-specific styling
- **Responsive Design**: CSS Grid and Flexbox with media queries for responsive behavior

## Components and Interfaces

### Header Component

**Props Interface:**
```typescript
interface HeaderProps {
  // No props needed - static content
}
```

**Functionality:**
- Fixed positioning with backdrop blur
- Smooth scroll navigation to sections
- Responsive navigation menu
- Logo display

### HeroSection Component

**Props Interface:**
```typescript
interface HeroSectionProps {
  // No props needed - static content
}
```

**Functionality:**
- Display main heading, tagline, and description
- James Baldwin quote with attribution
- Statistics bar with animated counters
- Responsive typography scaling

### MethodSection Component

**Props Interface:**
```typescript
interface MethodSectionProps {
  // No props needed - static content
}
```

**Functionality:**
- Three-column grid layout for method cards
- Hover effects on cards
- Arrow indicators between cards
- Responsive grid that collapses to single column on mobile

### ContactForm Component

**Props Interface:**
```typescript
interface ContactFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

interface FormData {
  name: string;
  email: string;
  interest: string;
  message: string;
}
```

**Functionality:**
- Form validation for required fields
- Email format validation
- Loading states during submission
- Success/error message display
- Form reset after successful submission

### Responsive Design Strategy

**Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px  
- Desktop: 1024px+

**Grid Adaptations:**
- 3-column grids → 1 column on mobile
- 2-column grids → 1 column on mobile
- Header navigation → stacked layout on mobile
- Reduced padding and margins on smaller screens

## Data Models

### Form Data Model

```typescript
interface ContactFormData {
  name: string;
  email: string;
  interest: 'workshop' | 'partnership' | 'newsletter' | 'other' | '';
  message: string;
}

interface FormValidation {
  isValid: boolean;
  errors: {
    name?: string;
    email?: string;
    interest?: string;
    message?: string;
  };
}
```

### Navigation Data Model

```typescript
interface NavigationItem {
  label: string;
  href: string;
  section: string;
}
```

## Error Handling

### Form Validation Errors

- **Client-side validation**: Real-time validation for required fields and email format
- **Error display**: Inline error messages below form fields
- **Error states**: Visual indicators (red borders, error text) for invalid fields

### Network Errors

- **Form submission failures**: Display user-friendly error messages
- **Retry mechanism**: Allow users to retry form submission
- **Graceful degradation**: Ensure core content is always accessible even if interactive features fail

### Accessibility Errors

- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Screen reader support**: Proper ARIA labels and semantic HTML
- **Focus management**: Visible focus indicators and logical tab order

## Testing Strategy

### Unit Testing

**Components to Test:**
- ContactForm: Form validation, submission handling, error states
- Navigation: Smooth scrolling functionality
- Responsive components: Grid layout adaptations

**Testing Tools:**
- React Testing Library for component testing
- Jest for test runner and assertions
- Mock Service Worker (MSW) for API mocking if needed

### Integration Testing

**User Flows to Test:**
- Complete navigation through all sections
- Form submission end-to-end flow
- Responsive behavior across breakpoints
- Accessibility compliance

### Visual Regression Testing

**Key Areas:**
- Section layouts and spacing
- Typography and color consistency
- Hover states and animations
- Mobile responsive layouts

### Performance Testing

**Metrics to Monitor:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

**Optimization Strategies:**
- Image optimization and lazy loading
- CSS and JavaScript minification
- Component code splitting if needed
- Font loading optimization

## Implementation Considerations

### Migration Strategy

1. **Preserve existing build configuration**: Maintain current package.json scripts and deployment setup
2. **Gradual component replacement**: Replace terminal components one by one with new design components
3. **Style migration**: Remove terminal-specific CSS and implement new design system
4. **Content migration**: Extract content from terminal files and integrate into new sections

### Browser Compatibility

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **CSS features**: CSS Grid, Flexbox, CSS Custom Properties, backdrop-filter
- **JavaScript features**: ES6+ features supported by Create React App

### Performance Optimization

- **Bundle size**: Monitor and optimize JavaScript bundle size
- **CSS optimization**: Use CSS custom properties for consistent theming
- **Image assets**: Optimize any images used in the design
- **Font loading**: Implement efficient web font loading strategies