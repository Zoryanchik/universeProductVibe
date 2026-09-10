You are an expert in JavaScript, TypeScript, Astro framework, and Feature-Sliced Design (FSD) architecture for scalable web development.

## Important NEW

- Ignore using margin-top approach for spacing, we use margin-bottom through the whole project
- Use semantic SEO markup for the best SEO optimization. We focus on such things as accessibility, seo-related attributes like "role", "alt"(for images) e.g.
- Use global components such as Link instead of <a>, Image instead of <img> and Button from design system instead of <button>. Check components in src/shared/ui
- instead of h2, h3, h4 use corresponding Title component from src/shared/ui and pass it correct "variant" property.
- Use headless aproach and extract logic to separate file from UI as it does in the project. Use local ui/lib folder for logic files.
- Make sure to add all content to /public/locales/en.json and other locales, do not hardcode content or keep in constants.

## Key Principles

- Write concise, technical responses with accurate Astro and React examples.
- Follow Feature-Sliced Design (FSD) architecture strictly.
- Leverage Astro's partial hydration and React islands effectively.
- Prioritize static generation and minimal JavaScript for optimal performance.
- Use descriptive variable names following FSD naming conventions.
- Maintain strict layer isolation and import rules.

## Feature-Sliced Design (FSD) Architecture

### Layer Hierarchy (Strict Import Rules)

```
app → pages-layer → widgets → features → entities → shared
```

**CRITICAL RULE:** Each layer can ONLY import from layers BELOW it. Never import upward.

```typescript
// ✅ Correct
import { Button } from "@/shared/ui"; // widget → shared
import { UserCard } from "@/entities/user"; // feature → entity

// ❌ Forbidden
import { Navbar } from "@/widgets/navbar"; // shared → widget (WRONG)
import { HomePage } from "@/pages-layer/home"; // widget → page (WRONG)
```

### Layer Responsibilities

| Layer           | Path               | Purpose                                                           |
| --------------- | ------------------ | ----------------------------------------------------------------- |
| **app**         | `src/app/`         | Global setup: layouts, styles, providers, third-party scripts     |
| **pages-layer** | `src/pages-layer/` | Page compositions (NOT routing—Astro handles routing in `/pages`) |
| **widgets**     | `src/widgets/`     | Composite UI blocks (Navbar, Footer, Sidebar)                     |
| **features**    | `src/features/`    | User interactions (forms, actions, toggles)                       |
| **entities**    | `src/entities/`    | Business entities (User, Document, Product)                       |
| **shared**      | `src/shared/`      | Reusable utilities, UI, API clients, types                        |

### Slice Structure

Every slice MUST follow this structure:

```
slice-name/
├── index.ts          # Public API (barrel export) — ONLY way to import from slice
├── ui/               # React (.tsx) and Astro (.astro) components
├── model/            # Business logic
│   ├── types.ts      # TypeScript interfaces and types
│   ├── constants.ts  # Constants and enums
│   └── store.ts       # State management (if needed)
├── api/              # Data fetching functions
└── lib/              # Slice-specific utilities
```

### Where to Place Code

| What                 | Where                                            | Example                                             |
| -------------------- | ------------------------------------------------ | --------------------------------------------------- |
| **Interfaces/Types** | `slice/model/types.ts`                           | `src/entities/user/model/types.ts`                  |
| **Constants**        | `slice/model/constants.ts` or `slice/constants/` | `src/entities/documents/model/constants/funnels.ts` |
| **Enums**            | `slice/model/constants.ts`                       | Export as `EEnumName`                               |
| **UI Components**    | `slice/ui/`                                      | `ComponentName.tsx` or `ComponentName.astro`        |
| **API Functions**    | `slice/api/`                                     | `fetch-user.ts`, `get-static-routes.ts`             |
| **Shared Types**     | `src/shared/types/`                              | Types used across multiple slices                   |
| **Shared Constants** | `src/shared/constants/`                          | App-wide constants                                  |
| **Utilities**        | `src/shared/lib/`                                | Helper functions, hooks                             |

### Public API (index.ts)

Every slice MUST have an `index.ts` that exports its public interface:

```typescript
// src/widgets/navbar/index.ts
export { Navbar } from "./ui/Navbar";
export type { NavbarProps } from "./model/types";

// ❌ Never import directly from internal files:
import { Navbar } from "@/widgets/navbar/ui/Navbar";

// ✅ Always import from index:
import { Navbar } from "@/widgets/navbar";
```

### Naming Conventions

- **Enums:** Prefix with `E` → `ELanguages`, `EFileType`, `EFunnels`
- **Interfaces:** Prefix with `I` or use descriptive names → `IUserProps`, `SeoProps`
- **Types:** Descriptive names → `PageParams`, `LocaleCode`
- **Components:** PascalCase → `UserCard.tsx`, `HomePage.astro`
- **Files:** kebab-case → `fetch-user.ts`, `api-routes.ts`

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── layout/             # Global layouts
│   │   └── seoLayout/      # SEO layout components
│   ├── styles/             # Global styles
│   │   ├── global.css      # Global CSS
│   │   └── vars.css        # CSS custom properties (design tokens)
│   ├── third-party/        # Third-party scripts (analytics, etc.)
│   └── types/              # Global TypeScript types
├── pages-layer/            # Pages layer (compositions)
│   ├── 404/                # 404 page
│   ├── base/               # Base page template
│   └── seoService/         # SEO service pages
│       ├── api/            # Page-specific data fetching
│       ├── model/           # Page-specific types
│       └── ui/              # Page components
├── widgets/                # Widgets layer
│   ├── footer/             # Footer widget
│   └── navbar/             # Navbar widget
├── features/               # Features layer (user interactions)
├── entities/               # Entities layer (business entities)
│   └── documents/          # Document entity
└── shared/                 # Shared layer
    ├── api/                # API clients, HTTP utilities
    │   └── cms/            # CMS (Strapi) client
    ├── config/             # Configuration
    ├── constants/          # App-wide constants
    ├── lib/                # Utilities, helpers
    │   ├── cms/            # CMS utilities
    │   ├── navigation/     # Navigation utilities
    │   ├── seo/            # SEO utilities
    │   ├── translations/   # i18n utilities
    │   └── utils/         # General utilities
    └── types/              # Shared TypeScript types

pages/                       # Astro routing (file-based)
├── [...lang]/              # Dynamic locale routes
├── [lang].astro            # Locale root page
├── [service].astro         # Service page
├── 404.astro               # 404 page
└── index.astro             # Root page

public/                      # Static assets
├── assets/                 # Images, fonts, etc.
└── locales/                 # Translation files
```

## Component Development

### Design System Components First

**Always check `@universe-forma/ui-pes` first** before creating custom components. Use design system components when available:

```tsx
// ✅ Prefer design system components
import { Button, Input, Card } from "@universe-forma/ui-pes";

// ❌ Avoid creating custom components if design system has them
// Only create custom components when design system doesn't provide what you need
```

### Astro Components

- Create `.astro` files for static/server-rendered components.
- Use Astro's component props for data passing.
- Leverage Astro's built-in components like `<Markdown />` when appropriate.
- Use scoped styling with `<style>` tags when needed.
- For interactive UI, wrap `@universe-forma/ui-pes` components in React islands.

### React Islands

- Use `.tsx` files for interactive React components.
- Use `client:*` directives judiciously for partial hydration:
  - `client:load` for immediately needed interactivity
  - `client:idle` for non-critical interactivity
  - `client:visible` for components that should hydrate when visible
- Place React components in `ui/` directories within slices.
- Import and use `@universe-forma/ui-pes` components directly in React islands.

### Component Example

```astro
---
// src/pages-layer/seoService/ui/home/HomePage.astro
import { BaseLayout } from "@/app/layout/seoLayout";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";
import { SeoHeroSection } from "@/pages-layer/seoService/ui/sections/seoHeroSection";
import type { HomePageProps } from "../model/types";

const { data } = Astro.props;
---

<BaseLayout>
  <Navbar />
  <SeoHeroSection data={data.hero} />
  <Footer />
</BaseLayout>
```

## Routing and Pages

- Astro handles routing via file-based routing in `/pages` directory.
- Page compositions live in `src/pages-layer/` (NOT routing).
- Implement dynamic routes using `[...slug].astro` syntax.
- Use `getStaticPaths()` for generating static pages with dynamic routes.
- Implement proper 404 handling with `404.astro` page.

### Static Routes Generation

- Page-specific static route generation lives in `pages-layer/[page]/api/`.
- Use `getStaticPaths()` in page files to generate routes.
- Example: `src/pages-layer/seoService/api/get-service-static-routes.ts`

## CMS Integration (Strapi)

### Schema Reference

All CMS types are auto-generated in:

```
src/shared/api/cms/cms-schema.ts
```

**This file is auto-generated. Do NOT modify directly.**

Regenerate with:

```bash
npm run generate-api-schema
```

### CMS HTTP Client

Use the typed client from `src/shared/api/cms/cms-http-client.ts`:

```typescript
import { cmsHttpClient, getAllRoutes } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";

// Type your responses using the schema
type ServicePage = components["schemas"]["ServicePageResponse"];

const data = await cmsHttpClient.getPage<ServicePage>(
  "/service-pages?locale=en"
);
```

### CMS Data Fetching Location

| Content Type  | Fetch Location                                      |
| ------------- | --------------------------------------------------- |
| Page data     | `src/pages-layer/[page]/api/`                       |
| Navbar/Footer | `src/shared/api/fetch-navbar.ts`, `fetch-footer.ts` |
| Locales       | `src/shared/api/fetch-locales.ts`                   |

## Styling

### Design System

We use **Tailwind CSS** with the **@universe-forma/ui-pes** design system.

Style imports are configured in:

```
src/app/styles/global.css  — Global styles and base layer
src/app/styles/vars.css    — CSS custom properties (variables)
```

The design system theme is imported in `global.css`:

```css
@import "tailwindcss";
@import "../../../node_modules/@universe-forma/ui-pes/es/theme.css";
@import "./vars.css";
@source "../../../node_modules/@universe-forma/ui-pes/es";
```

### Using @universe-forma/ui-pes Components

The `@universe-forma/ui-pes` package provides pre-built React components that follow the design system. Import and use them directly in your React components.

#### Importing Components

```tsx
// ✅ Correct - Import specific components
import { Button, Input, Card, Modal } from "@universe-forma/ui-pes";

// ✅ Correct - Import types if needed
import type { ButtonProps, InputProps } from "@universe-forma/ui-pes";

// ❌ Avoid - Don't import everything
import * as UIPES from "@universe-forma/ui-pes";
```

#### Using Components in React Islands

Since `@universe-forma/ui-pes` components are React components, use them in `.tsx` files (React islands):

```tsx
// src/widgets/example/ui/ExampleWidget.tsx
import { Button, Input } from "@universe-forma/ui-pes";
import type { ButtonProps } from "@universe-forma/ui-pes";

interface ExampleWidgetProps {
  title: string;
  onSubmit: (value: string) => void;
}

export const ExampleWidget: React.FC<ExampleWidgetProps> = ({
  title,
  onSubmit,
}) => {
  const [value, setValue] = React.useState("");

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter text..."
      />
      <Button onClick={() => onSubmit(value)} className="mt-4">
        Submit
      </Button>
    </div>
  );
};
```

#### Using Components in Astro Files

To use `@universe-forma/ui-pes` components in Astro files, wrap them in a React island:

```astro
---
// src/pages-layer/example/ui/ExamplePage.astro
import { ExampleWidget } from "@/widgets/example";
---

<ExampleWidget
  client:load
  title="Example"
  onSubmit={(value) => console.log(value)}
/>
```

Or create a wrapper component:

```tsx
// src/widgets/example/ui/ExampleWrapper.tsx
import { Button } from "@universe-forma/ui-pes";

interface ExampleWrapperProps {
  text: string;
}

export const ExampleWrapper: React.FC<ExampleWrapperProps> = ({ text }) => {
  return (
    <div>
      <p>{text}</p>
      <Button>Click me</Button>
    </div>
  );
};
```

```astro
---
// In your .astro file
import { ExampleWrapper } from "@/widgets/example/ui/ExampleWrapper";
---

<ExampleWrapper client:load text="Hello World" />
```

#### Component Props and Styling

- **Use component props** for configuration and behavior
- **Use `className` prop** to add additional Tailwind classes when needed
- **Don't override design system styles** unless absolutely necessary
- **Prefer design system variants** over custom styling

```tsx
// ✅ Correct - Use design system props
<Button variant="primary" size="large" disabled={isLoading}>
  Submit
</Button>

// ✅ Correct - Add additional classes when needed
<Button className="mt-4 w-full">Submit</Button>

// ❌ Avoid - Overriding design system styles
<Button style={{ backgroundColor: "red" }}>Submit</Button>
```

#### Available Components

Common components available from `@universe-forma/ui-pes`:

- `Button` - Buttons with variants (primary, secondary, etc.)
- `Input` - Form inputs
- `Card` - Card containers
- `Modal` - Modal dialogs
- `Select` - Dropdown selects
- `Checkbox` - Checkboxes
- `Radio` - Radio buttons
- `Textarea` - Text areas
- `Badge` - Badges and labels
- `Tooltip` - Tooltips
- And more...

Check the `@universe-forma/ui-pes` documentation for the full list of available components and their props.

#### Configuration

The design system is configured in `astro.config.ts`:

```typescript
vite: {
  ssr: {
    noExternal: ["@universe-forma/ui-pes"], // Required for SSR
  },
}
```

This ensures the package works correctly with Astro's SSR.

### Rules

1. **Use Tailwind utility classes** for all styling
2. **Use design system components** from `@universe-forma/ui-pes` when available
3. **Use CSS variables** for custom values (define in `vars.css`)
4. **Never use inline styles** — No `style={{ }}` or `style=""`
5. **Prefer design system components** over custom implementations when possible

```tsx
// ✅ Correct
<div className="flex items-center gap-4 bg-primary text-white p-4">
<Button variant="primary">Click me</Button>

// ❌ Forbidden
<div style={{ display: "flex", alignItems: "center" }}>
<div style="display: flex; align-items: center;">
<button style={{ backgroundColor: "blue" }}>Click me</button>
```

### Adding Custom Variables

Add to `src/app/styles/vars.css`:

```css
@layer base {
  :root {
    --custom-color: #123456;
    --custom-spacing: 2rem;
  }
}
```

Use in Tailwind:

```tsx
<div className="bg-[var(--custom-color)] p-[var(--custom-spacing)]">
```

### Component Styling Pattern

```tsx
// Use cn() or clsx() for conditional classes
import { cn } from "@/shared/lib/utils/cn";

interface ButtonProps {
  variant: "primary" | "secondary";
  className?: string;
}

export const Button = ({ variant, className }: ButtonProps) => (
  <button
    className={cn(
      "rounded-lg px-4 py-2 font-medium transition-colors",
      variant === "primary" && "bg-primary text-white",
      variant === "secondary" && "bg-gray-100 text-gray-900",
      className
    )}
  >
    Click me
  </button>
);
```

## TypeScript

### Strict Mode

TypeScript strict mode is enabled. Follow these rules:

1. **Always define types for props**
2. **Always define return types for functions**
3. **Never use `any`** — use `unknown` and narrow types
4. **Use `readonly` for immutable data**

```typescript
// ✅ Correct
interface UserProps {
  readonly id: string;
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ Forbidden
const fetchUser = async (id: any) => { ... }
```

### React Components

Use functional components with typed props:

```tsx
interface CardProps {
  readonly title: string;
  readonly children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className }) => (
  <div className={cn("rounded-lg border p-4", className)}>
    <h3 className="font-semibold">{title}</h3>
    {children}
  </div>
);
```

## Data Fetching

### Page Data Fetching

- Page-specific data fetching lives in `pages-layer/[page]/api/`.
- Use `getStaticPaths()` for static route generation.
- Fetch data at build time using Astro's `getStaticPaths()`.

### API Clients

- Shared API clients live in `src/shared/api/`.
- CMS client: `src/shared/api/cms/cms-http-client.ts`
- API routes: `src/shared/api/api-routes.ts`

### Example

```typescript
// src/pages-layer/seoService/api/fetch-service-page.ts
import { cmsHttpClient } from "@/shared/api/cms/cms-http-client";
import type { components } from "@/shared/api/cms/cms-schema";

type ServicePage = components["schemas"]["ServicePageResponse"];

export const fetchServicePage = async (
  slug: string,
  locale: string
): Promise<ServicePage> => {
  return await cmsHttpClient.getPage<ServicePage>(
    `/service-pages?filters[slug][$eq]=${slug}&locale=${locale}`
  );
};
```

## SEO and Meta Tags

- Use SEO layout from `src/app/layout/seoLayout/`.
- Implement canonical URLs for proper SEO.
- Use the `<SEO>` component pattern for reusable SEO setups.
- SEO utilities live in `src/shared/lib/seo/`.

## Internationalization (i18n)

- Translation files live in `public/locales/[lang]/translation.json`.
- Use translation utilities from `src/shared/lib/translations/`.
- Server-side: `server-t.ts`
- Client-side: `useTranslation.ts` hook

## Performance Optimization

- Minimize use of client-side JavaScript; leverage Astro's static generation.
- Use `client:*` directives judiciously for partial hydration.
- Implement proper lazy loading for images and other assets.
- Utilize Astro's built-in asset optimization features.

## Build and Deployment

- Build command: `npm run build`
- Generate API schema before building: `npm run generate-api-schema`
- Static output: `dist/` directory
- Environment variables configured in `astro.config.ts`
- Use static hosting platforms compatible with Astro (Netlify, Vercel, etc.).

## Import Aliases

```typescript
@/        → src/
@public/  → public/
```

Configured in `tsconfig.json` and `astro.config.ts`.

## Key Conventions

1. **Follow FSD layer rules strictly** — Never import upward.
2. **Use TypeScript** for enhanced type safety.
3. **Always export from `index.ts`** — Never import from internal files.
4. **Use Tailwind utility classes** — No inline styles or `@apply`.
5. **Implement proper error handling** and logging.
6. **Prefer `@universe-forma/ui-pes` components** — Check design system first before creating custom components.
7. **Import design system components directly** — Use named imports from `@universe-forma/ui-pes` in React islands.

## Testing

- Implement unit tests for utility functions and helpers.
- Use end-to-end testing tools like Cypress for testing the built site.
- Implement visual regression testing if applicable.

## Accessibility

- Ensure proper semantic HTML structure in Astro components.
- Implement ARIA attributes where necessary.
- Ensure keyboard navigation support for interactive elements.
- Use ESLint plugin `eslint-plugin-jsx-a11y` for accessibility checks.

## Performance Metrics

- Prioritize Core Web Vitals (LCP, FID, CLS) in development.
- Use Lighthouse and WebPageTest for performance auditing.
- Implement performance budgets and monitoring.

## References

- [Astro Documentation](https://docs.astro.build/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
