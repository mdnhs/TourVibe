<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TourVibe Management - Agent Guidelines

## 1. UI & Aesthetics
*   **Premium Dark Theme:** The admin dashboard utilizes a sophisticated, ultra-dark aesthetic. Rely on deep gradients (e.g., `bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e1b4b]`) rather than flat colors or generic dark modes.
*   **Atmospheric Effects:** Use subtle blurs (`blur-2xl`, `blur-3xl`), dot-grid overlays (`opacity-[0.035]`), and minimal shimmer lines (`bg-gradient-to-r from-transparent via-violet-400/60 to-transparent`) to create depth.
*   **Flattened Branding:** Prefer minimalist, gradient-backed flat icons over heavy 3D shadow effects for logos and main identifiers.

## 2. React 19 & Next.js 16 Compliance
*   **Script Tags:** NEVER use native `<script>` tags inside React components; they will trigger hydration errors in React 19. ALWAYS use `next/script` (with appropriate `strategy` like `afterInteractive`) and place them at the end of the `<body>` (or outside the fragment root), not inside `<head>`.
*   **Hydration:** Be cautious with dynamically generated IDs. For `@dnd-kit` contexts or similar tools that auto-generate ARIA IDs, pass a stable `id` generated via `React.useId()` to prevent client/server hydration mismatches.

## 3. Base UI / Component Structure
*   **`asChild` vs `render`:** When working with `@base-ui/react` primitives (which power the custom shadcn components in this project), the `asChild` pattern is implemented via the `render` prop. If you are creating or modifying triggers (Popover, Dropdown, Dialog, Tooltip), ensure you map `asChild` to the `render` prop to avoid invalid HTML nesting (e.g., `<button>` inside `<button>`).
*   **Menu Contexts:** Group labels (like `DropdownMenuLabel`) MUST be wrapped in a `DropdownMenuGroup` to ensure they receive the correct `MenuGroupRootContext`.
*   **Table DOM Validation:** DO NOT wrap HTML table elements (`<tr>`, `<th>`, `<td>`) with generic `<div>` context providers (like `DndContext` or `SortableContext`) unless you are certain they won't render an invalid DOM structure. Place such contexts entirely outside the `<Table>` component.

## 4. Reusability
*   **DataTable:** A highly robust, custom `DataTable` component resides in `src/components/ui/data-table/`. It supports faceted filtering, pagination, column reordering, row reordering, and integrates with `nuqs` for URL state management. ALWAYS use this component for listing entities in the dashboard rather than rebuilding tables from scratch.
