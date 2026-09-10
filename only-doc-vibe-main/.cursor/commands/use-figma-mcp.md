# Use Figma Design via MCP

Fetch design specifications from Figma using MCP and clone the design into the codebase.

## Workflow

### Step 1: Request Figma URL

**IMPORTANT:** You MUST ask the user for the Figma URL before proceeding.

Ask: "Please provide the Figma URL of the design selection you'd like me to clone."

**Do NOT proceed** until the user provides the URL.

### Step 2: Fetch Design Variables via MCP

Once you have the URL:

1. Use MCP resources/tools to fetch all design variables from the Figma selection:
   - Colors, spacing, typography, corner radiuses, shadows
   - Component specifications (dimensions, layout, constraints)
   - Style information (fonts, sizes, line heights)
   - Assets (images, icons)

2. Extract all applied variables (local variables and design tokens)

### Step 3: Clone the Design

After fetching variables:

1. **Map to CSS variables**: Convert Figma values to CSS custom properties (follow `scripts/convert-figma-vars.js` pattern)
2. **Update styles**: Add variables to `src/app/styles/vars.css` or `src/styles/vars.css` using `@layer base`
3. **Create components**:
   - Use FSD architecture (place in appropriate layers)
   - React (`.tsx`) for interactive, Astro (`.astro`) for static
   - Proper barrel exports and import rules
4. **Apply styling**: Tailwind utility classes only, no inline styles
5. **Type safety**: TypeScript interfaces for all props, no `any`

## Rules

- Always ask for URL first
- Fetch all variables (don't skip any)
- Follow FSD architecture and project conventions
- Use Tailwind CSS exclusively for styling
- Always make sure to use components from our design system - "@universe-forma/ui-pes". Check its structure and componets firstly.
