# Phase 2: Categories - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver category and subcategory management with transaction-link integrity rules. Users can create, edit, and delete income/expense categories organized in a single-level parent-subcategory hierarchy. Deletion is blocked when linked transactions exist. The DB schema and seed data already exist from Phase 1 migrations — this phase builds the backend commands, frontend UI, and CRUD flows.

</domain>

<decisions>
## Implementation Decisions

### Category list layout

- Tabbed view separating income (Ingresos) and expense (Gastos) categories
- Within each tab, grouped sections: parent categories with subcategories indented underneath
- Each row shows: Lucide icon (prominent, next to name), category name, subcategory count, and columns for transaction count + total amount (designed to display data once Phase 3 delivers transactions — show zeros/dashes until then)
- No search/filter bar — the list is short enough that tabs + visual scanning suffice
- Actions accessed via right-click context menu: Editar, Eliminar, Agregar subcategoria
- Top-level "+ Nueva categoria" button creates parent categories; subcategories created via context menu on a parent

### Category form & editing flow

- Modal form overlaying the category list (not a separate page)
- Income/expense type chosen manually in the form (not auto-set from active tab)
- Type change allowed when editing: switching type cascades to all subcategories; blocked if the category or any subcategory has linked transactions
- Subcategories can change their parent category (within same type), but parent categories cannot be demoted to subcategories
- Single-level nesting enforced: parent → subcategory only, no sub-subcategories

### Modal interaction details

- When "Agregar subcategoria" triggered from context menu: parent field pre-filled and locked, type inherited from parent. User fills name and picks icon
- Inline real-time validation as user types/selects (errors appear below each field, e.g., "Este nombre ya existe")
- On successful create/edit: close modal, show success toast, list refreshes to show changes
- On dismiss (click outside or Escape) with unsaved changes: show "Descartar cambios?" confirmation before closing

### Sort behavior

- Dropdown menu in top-right of category list area
- Alphabetical A-Z only for Phase 2 (additional sort options like "by usage" and "custom order" deferred until transaction data exists)
- Subcategories sorted alphabetically within their parent group
- Sort preference persisted per-tab (income and expense tabs can have different sort settings)

### Deletion & integrity

- Hard delete (not soft delete/archive) — categories are simple enough that archive adds unnecessary complexity
- When deletion is blocked due to linked transactions (CATE-04): show clear message with guidance — "Esta categoria tiene N transacciones vinculadas. Reasigna las transacciones a otra categoria antes de eliminar."
- Deleting a parent with subcategories: cascade delete all subcategories with confirmation modal explaining what will be deleted (blocked if any subcategory has linked transactions)
- For unlinked categories: simple "Estas seguro?" confirmation modal with category name

### Icons & visual identity

- Lucide icon library (not emojis) — curated grid of ~30-40 finance-relevant icons displayed in the category form modal
- Icons rendered monochrome in theme colors: green-tinted for income categories, red/blood-tinted for expense categories
- Icons displayed prominently next to category name in the list view
- Subcategories inherit parent's icon by default but can override with their own choice
- Existing seed data (migration 003) migrated from emoji strings to Lucide icon names via new migration

### Seed data & empty states

- Seed categories treated identically to user-created categories — no visual distinction, fully editable and deletable
- When a tab has no categories: themed empty state with message (e.g., "No hay categorias de ingreso") and prominent CTA button to create the first one
- No "reset to defaults" feature — seed data is a one-time migration. Once deleted, it's gone

### Claude's Discretion

- Exact modal sizing and positioning
- Toast message text and duration
- Specific Lucide icon curation (which ~30-40 icons to include)
- Empty state illustration/visual treatment
- Context menu styling and positioning
- Sort dropdown styling
- Loading states during CRUD operations

</decisions>

<specifics>
## Specific Ideas

- Transaction stats columns (count + total) should be structurally present from Phase 2 even though they'll show zeros — avoids layout shifts when Phase 3 adds real data
- Context menu approach chosen over hover actions or persistent buttons — matches desktop app conventions and the retro aesthetic
- Modal form chosen over dedicated pages to keep the flow lightweight — categories are simpler entities than accounts
- Per-tab sort persistence means the user can have income sorted differently from expense if they prefer

</specifics>

<deferred>
## Deferred Ideas

- Sort "by usage" option — requires transaction data (Phase 3+)
- Custom manual sort order (drag to reorder) — requires sort_order column and drag UI, future enhancement
- Category-level spending analytics — belongs in Dashboard (Phase 5)
- Reassignment flow when deleting categories with transactions — potential future UX enhancement beyond the guidance message

</deferred>

---

_Phase: 02-categories_
_Context gathered: 2026-02-27_
