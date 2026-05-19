# 🛠️ Development Setup & Testing Guide

**Purpose:** Complete guide for local development, testing, and troubleshooting  
**Status:** Ready for developers  
**Updated:** 2026-05-19

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- Text editor (VS Code recommended)

### Setup

```bash
# Clone repository (if needed)
cd 01_Core_Platform/getupsoft-site

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Visit http://localhost:5176/redesign/
```

### Build for Production

```bash
npm run build    # TypeScript + Vite build
npm run preview  # Preview built site locally
```

---

## Project Structure

```
src/
├── components/ui/              # Phase 1: UI component library
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Layout.tsx (Container, Section)
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Selectors.tsx
├── pages/                       # Page components
│   ├── HomePage.tsx            # Phase 2: Redesigned home
│   ├── ProductsPage.tsx
│   ├── SolutionsPage.tsx
│   ├── AboutPage.tsx
│   ├── ContactPage.tsx         # Phase 3: Forms
│   └── DiagnosticPage.tsx
├── lib/
│   ├── erp/                    # Phase 3: ERP adapters
│   │   ├── types.ts
│   │   ├── mock-provider.ts    # MockERPProvider
│   │   ├── odoo-provider.ts    # OdooProvider
│   │   └── index.ts            # Factory
│   ├── email/                  # Phase 3: Email notifications
│   │   ├── types.ts
│   │   ├── mock-provider.ts    # MockEmailProvider
│   │   ├── smtp-provider.ts    # SMTPEmailProvider
│   │   └── index.ts            # Factory
│   └── validation/             # Phase 3: Form validation
│       └── schemas.ts          # Zod schemas
├── hooks/
│   ├── useContent.ts           # Language context hook
│   └── useERPSubmission.ts     # Form submission hook
├── contexts/
│   └── LanguageContext.tsx     # i18n state management
├── content/
│   ├── site.es.ts             # Spanish content
│   └── site.en.ts             # English content
├── routes.tsx                  # React Router config
└── styles.css                  # TailwindCSS imports

docs/
├── design-system.md            # Phase 1 design tokens
├── content-architecture.md     # Phase 2 content structure
├── ODOO_SETUP.md              # Phase 3 ERP setup
├── EMAIL_SETUP.md             # Phase 3 email setup
└── DEVELOPMENT.md             # This file
```

---

## Development Workflow

### Starting the Dev Server

```bash
npm run dev
# Vite dev server starts on http://localhost:5176

# Hot Module Replacement (HMR) enabled
# Changes to components, styles, content auto-reload
```

### TypeScript Compilation

```bash
# During development, type checking happens in background
# To check types explicitly:
npx tsc --noEmit

# VS Code: Install "TypeScript Vue Plugin" for best experience
```

### Styling with Tailwind

```bash
# Tailwind classes are configured in tailwind.config.ts
# Design tokens: colors, spacing, typography, shadows

# Example: Add responsive button styling
<button className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/80 focus:outline-offset-2 focus:outline-2 focus:outline-primary">
  Click me
</button>

# Responsive prefixes: sm:, md:, lg:, xl:, 2xl:
# Mobile-first approach: base styles apply to all screens
```

### Form Development

#### Adding a New Form

1. **Create validation schema** in `src/lib/validation/schemas.ts`:
   ```typescript
   export const myFormSchema = z.object({
     name: z.string().min(2),
     email: z.string().email(),
     // ... other fields
   });
   ```

2. **Create page component** in `src/pages/MyFormPage.tsx`:
   ```typescript
   import { useERPSubmission } from '../hooks/useERPSubmission'
   import { validateMyForm } from '../lib/validation/schemas'
   
   export const MyFormPage: React.FC = () => {
     const { state, submitForm, reset } = useERPSubmission()
     const [formData, setFormData] = useState({...})
     const [errors, setErrors] = useState({})
     
     const handleSubmit = async (e) => {
       e.preventDefault()
       const result = validateMyForm(formData)
       if (!result.success) {
         setErrors(result.errors || {})
         return
       }
       await submitForm(formData)
     }
   }
   ```

3. **Add route** in `src/routes.tsx`:
   ```typescript
   { path: "my-form", element: <MyFormPage /> }
   ```

4. **Test locally**:
   - http://localhost:5176/redesign/my-form
   - Fill form with invalid data → see validation errors
   - Fix errors → submit → see success message

#### Form Validation Best Practices

- Always validate on submit (client-side)
- Show field-level errors immediately below input
- Clear error when user starts typing
- Highlight invalid fields with red border
- Provide helpful, user-friendly error messages
- Validate at ERP before submission
- Use Zod for runtime type safety

### ERP Integration Development

#### Using Mock ERP

```bash
# Default: npm run dev uses MockERPProvider
# Perfect for testing without Odoo

# In console, you'll see:
# [ERP] Using MOCK provider
# [useERPSubmission] Contact form submitted: TICKET-1
```

#### Testing with Real Odoo

1. **Set environment variables**:
   ```bash
   VITE_ERP_TYPE=odoo
   VITE_ODOO_HOST=your-odoo-instance.com
   VITE_ODOO_PORT=8069
   VITE_ODOO_DATABASE=your-database
   VITE_ODOO_USERNAME=admin
   VITE_ODOO_PASSWORD=your-password
   ```

2. **Build and test**:
   ```bash
   npm run build
   npm run preview
   # Visit http://localhost:4173/redesign/
   # Submit form → check Odoo for lead/ticket
   ```

#### Implementing Custom ERP Provider

```typescript
// src/lib/erp/custom-provider.ts
import { IERPProvider, ContactFormData } from './types'

export class CustomProvider implements IERPProvider {
  async connect() { /* ... */ }
  async createLead(data: ContactFormData) { /* ... */ }
  async createTicket(leadId, ticket) { /* ... */ }
  // ... implement other methods
}
```

### Email Integration Development

#### Testing Mock Email

```bash
# Default: npm run dev uses MockEmailProvider
# Emails logged to console:
# [MockEmailProvider] Email sent {
#   to: "user@example.com",
#   type: "contact-form",
#   messageId: "mock-1234567890-xyz"
# }
```

#### Testing SMTP Email

```bash
# Set environment variables:
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASS=your-app-password
VITE_SMTP_FROM=noreply@example.com

# Build and test:
npm run build && npm run preview
# Submit form → check inbox for confirmation email
```

---

## Testing

### Manual Testing

1. **UI Testing**:
   - Resize browser to test responsive design
   - Test keyboard navigation (Tab, Enter, Esc)
   - Test form submission with valid/invalid data

2. **Form Testing**:
   - Test validation with invalid data (too short, invalid format)
   - Test validation errors appear/disappear correctly
   - Test form submits with valid data
   - Test success message appears with ticket ID

3. **Language Testing**:
   - Click language toggle (EN/ES)
   - Verify all content switches languages
   - Test form submission in both languages
   - Verify email sent in correct language

4. **ERP Integration Testing**:
   - Submit form with mock ERP (default)
   - Check console for ticket ID
   - Verify lead/ticket created in Odoo (if using real integration)

### Browser DevTools

```javascript
// In browser console:

// Check current language
window.__LANGUAGE__ // (if exposed via context)

// Check form data before submission
console.log('formData:', formData)

// Monitor ERP provider
window.__ERP_LOGS__ // (if logging enabled)
```

---

## Debugging

### Common Issues

#### TypeScript Errors

```
error TS2307: Cannot find module
```

**Solution**: Install missing dependencies
```bash
npm install --legacy-peer-deps
npx tsc --noEmit  # Check all errors
```

#### Port Already in Use

```
error listen EADDRINUSE: address already in use :::5176
```

**Solution**: Kill process using port
```bash
# On Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5176).OwningProcess | Stop-Process
```

#### HMR Not Working

- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)
- Restart dev server: `npm run dev`

#### Form Not Submitting

1. Check browser console for errors
2. Verify form data is valid (check validation schema)
3. Check ERP provider is initialized
4. Verify environment variables set correctly

#### Email Not Sending

1. Check browser console for email logs
2. For SMTP: Verify credentials and port
3. Check firewall isn't blocking SMTP port
4. Try Gmail app password (not account password)

---

## Performance Optimization

### Bundle Analysis

```bash
npm run build
# Output shows bundle size and breakdown
# Current: 473KB JS (includes old + new site)

# To optimize:
# - Remove unused pages/components
# - Use code splitting for large pages
# - Lazy load images and components
```

### Development Performance

```bash
# Vite automatically handles:
# - Hot Module Replacement (HMR)
# - Dependency pre-bundling
# - Import analysis

# To improve dev experience:
# - Use VS Code extension for TypeScript
# - Enable Tailwind IntelliSense
# - Install ESLint extension
```

---

## Git Workflow

### Creating a Feature Branch

```bash
# Feature branches for bug fixes:
git checkout -b fix/form-validation-bug

# Feature branches for new features:
git checkout -b feat/admin-dashboard

# Work on branch:
git add .
git commit -m "fix: improve form error messages"

# Push and create PR:
git push origin fix/form-validation-bug
# Then create pull request on GitHub
```

### Commit Message Format

Follow conventional commits:

```
feat(forms): add email validation schema
fix(email): correct SMTP timeout handling
docs(setup): update installation instructions
style(button): improve hover state animation
refactor(routing): simplify route definitions
```

### Before Creating PR

```bash
npm run build    # Ensure build succeeds
npm run preview  # Test in production mode
git log -5       # Review your commits
```

---

## Environment Variables

### Development (.env.development or .env.local)

```bash
# ERP
VITE_ERP_TYPE=mock
VITE_USE_MOCK=true
VITE_AUTO_CONNECT_ERP=false

# Email
VITE_USE_MOCK_EMAIL=true
VITE_DISABLE_EMAIL=false

# Logging
VITE_DEBUG=true
```

### Production (.env.production)

```bash
# ERP
VITE_ERP_TYPE=odoo
VITE_ODOO_HOST=your-odoo-server.com
VITE_ODOO_PORT=8069
VITE_ODOO_DATABASE=production_db
VITE_ODOO_USERNAME=api_user
VITE_ODOO_PASSWORD=secure_password
VITE_AUTO_CONNECT_ERP=true

# Email
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_SECURE=false
VITE_SMTP_USER=noreply@company.com
VITE_SMTP_PASS=app_password
VITE_SMTP_FROM=noreply@company.com

# Security
VITE_DISABLE_EMAIL=false
VITE_USE_MOCK=false
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server with HMR
npm run build           # Production build
npm run preview         # Preview built site locally

# Type checking
npx tsc --noEmit       # Check types without emitting

# Git
git status             # See current changes
git diff              # See detailed changes
git log --oneline -10  # See recent commits

# Debugging
node --inspect app.js  # Start debugger (advanced)
```

---

## Resources

- **React Router**: https://reactrouter.com/
- **TailwindCSS**: https://tailwindcss.com/
- **TypeScript**: https://www.typescriptlang.org/
- **Zod**: https://zod.dev/
- **Vite**: https://vitejs.dev/
- **React Hook Form**: https://react-hook-form.com/ (future enhancement)

---

## Getting Help

1. **Check documentation**: docs/ folder
2. **Search issues**: GitHub issues or Slack
3. **Ask team**: Slack #development channel
4. **Debug systematically**:
   - Reproduce issue
   - Check console errors
   - Check network tab
   - Check component state (React DevTools)

---

_Development Guide v1.0 · Updated 2026-05-19 · Ready for Contributors_
