# Frontend Assignment — Tree View + Kanban Board

A production-grade React + TypeScript project built with Vite, featuring two polished UI modules:

- **Tree View Project** (hierarchical data editor with lazy loading and DnD)
- **Kanban Board Project** (multi-column board with inline editing and DnD)

The app starts with a home screen that lets you open either project.

## Live Routes

| Route | Page |
|------|------|
| `/` | Home (project selection cards) |
| `/tree` | Tree View project |
| `/kanban` | Kanban Board project |

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- DnD Kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- React Router DOM

No heavy UI framework is used.

## Key Features

### 1) Tree View

- Expand/collapse with smooth animated transitions
- Chevron rotation animation
- Professional dotted connector lines for nested tree structure
- Add node (root or child) with inline input
- Edit node name on double-click
- Delete node + full subtree with custom confirmation modal
- Lazy loading simulation on first expand (with spinner + shimmer skeleton)
- Drag and drop:
  - reorder within same level
  - move across parents
  - hierarchy integrity protection (prevents invalid self-descendant moves)
- Drag overlay preview + highlighted drop targets

### 2) Kanban Board

- Default columns: **Todo**, **In Progress**, **Done**
- Add card inline per column
- Edit card title inline (Enter save, Escape cancel, blur save)
- Delete card action
- Drag and drop:
  - reorder inside same column
  - move cards across columns
  - drag overlay preview + smooth interactions
- Responsive layout:
  - mobile: stacked
  - tablet: 2 columns
  - desktop: 3 columns

### 3) Global UX

- Dark mode with toggle and `localStorage` persistence
- Shared button variants (`primary`, `secondary`, `destructive`)
- Consistent spacing, typography, transitions, and shadows
- Page-level fade-in transitions

## Project Structure

```text
src/
  components/
    tree/
    kanban/
    ui/
  pages/
  types/
  utils/
  App.tsx
  main.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Architecture Notes

- Tree and Kanban are separated into reusable component groups.
- Strong TypeScript domain models live in `src/types`.
- Tree operations (`findNode`, `addNode`, `removeNode`, `updateNode`, `moveNode`) are centralized in utility functions.
- UI primitives (Button, ConfirmModal, ThemeToggle) are reusable and style-consistent.
- State updates are immutable and intentionally scoped.

## Accessibility & UX Behaviors

- Keyboard-friendly inline editing (Enter/Escape/blur)
- Visual focus rings for form controls and buttons
- Hover and drag visual affordances for discoverability

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview production output

## Future Enhancements (Optional)

- Add automated tests (unit + interaction)
- Persist tree/kanban state to backend or local storage
- Add undo/redo for drag and edit actions

---

If you’re reviewing this as an interview project, start at `/` and test both modules end-to-end including editing, drag-and-drop, lazy loading, and theme switching.
