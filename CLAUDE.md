# TourVibe Management - Project Guidelines

## Core Principles
*   **Design Excellence:** Maintain a sophisticated, premium ultra-dark aesthetic.
*   **Performance & Standard Compliance:** Adhere strictly to React 19 and Next.js 16 (Turbopack) rules to avoid hydration errors and rendering warnings.
*   **Component Reusability:** Leverage the established `DataTable` suite for all listing interfaces.

## 1. UI & Aesthetics
*   **Deep Gradients:** Use rich, deep gradients for main containers.
    *   *Example:* `bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b]`.
*   **Atmospheric Textures:** Implement subtle orbs, dot-grid overlays (`opacity-[0.035]`), and shimmer lines to create depth without clutter.
*   **Flattened Branding:** Icons and logos should be minimalist and flat, avoiding heavy 3D shadows or intense outer rings.
*   **Centered Layouts:** In minimized/collapsible states, ensure all elements (icons, avatars) are perfectly centered within their backgrounds.

## 2. Technical Standards (React 19 / Next.js 16)
*   **Script Handling:** NEVER render native `<script>` tags inside component trees. Use the `next/script` component.
    *   *Placement:* Keep scripts outside the fragment root or at the end of the `<body>`. Avoid placing them inside `<head>` in `layout.tsx` unless using the `beforeInteractive` strategy.
*   **Stable Identifiers:** For dynamic features like Drag & Drop (`@dnd-kit`), always provide a stable `id` to `DndContext` using `React.useId()` to prevent hydration mismatches.
*   **Table Nesting:** Maintain strict HTML table structure. Do not place `div` wrappers (like context providers) between `<tbody>` and `<tr>` or `<tr>` and `<td>`. Wrap the entire table instead.

## 3. Component Patterns
*   **Base UI Integration:** This project uses `@base-ui/react` primitives.
    *   **`asChild` implementation:** Map the `asChild` prop to the primitive's `render` prop. This prevents invalid nesting like `<button>` inside `<button>`.
*   **Menu Contexts:** Standalone `DropdownMenuLabel` (or any group label) MUST be wrapped in a `DropdownMenuGroup` to satisfy the internal context requirements.
*   **DataTable:** Located at `src/components/ui/data-table/`. Features:
    *   Integrated `nuqs` for URL-based search and pagination.
    *   Built-in column and row drag-and-drop reordering.
    *   Faceted filtering support.
    *   Column visibility toggling.

## 4. Workflows
*   **Build & Lint:** Always verify changes by running the local build or linting checks to catch React 19 specific warnings early.
*   **Atomic Changes:** Keep UI refactors surgical and verify hydration on each major step.
