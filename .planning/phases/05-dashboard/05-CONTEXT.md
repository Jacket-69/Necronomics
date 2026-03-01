# Phase 5: Dashboard - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a dashboard page showing snapshots of the user's current financial position and recent activity. The dashboard has 4 data panels: consolidated total balance, current-month income vs expense, top spending categories for the current month, and a recent-transactions panel. The dashboard becomes the app's home page (/ route). Advanced charts (D3 donut, bar, line, treemap) are v2 scope (CHRT-01 through CHRT-05).

</domain>

<decisions>
## Implementation Decisions

### Widget layout and hierarchy

- Hero balance section at the top, spanning full width
- Hero shows the consolidated total in base currency, plus a compact row of per-account balances below it
- Below the hero: 3 panels in a single row
  - Left 25%: Income vs expense panel
  - Center 25%: Top spending categories panel
  - Right 50%: Recent transactions panel (wider because it holds tabular data)
- Dashboard replaces `/accounts` as the home page — `/` route redirects to `/dashboard`
- "Dashboard" link added to nav bar as the first item

### Income vs expense presentation

- Two numbers displayed side by side: income on the left, expense on the right
- Net result (income minus expense) shown below them
- Net is color-coded: green text if positive (surplus), red text if negative (deficit)
- Panel title shows current month name + year (e.g., "Marzo 2026") — in Spanish
- All amounts converted to base currency (CLP by default) — no multi-currency breakdown here

### Top spending categories display

- Show top 5 expense categories, with an "Otros" entry grouping all remaining categories
- Each entry: category name on the left, amount on the right, with a horizontal bar showing proportion of total spending
- Uses parent categories only — subcategory spending rolls up to its parent
- All proportion bars use uniform theme green color (#4a5d23 / #7fff00 range)
- Ranked from highest to lowest spending

### Recent transactions panel

- Shows the 10 most recent transactions
- Each row displays: date, amount + type (income/expense), category, account name, description
- Styled as compact table rows matching existing transaction table patterns but simplified
- "Ver todas" link at the bottom of the panel navigating to `/transactions`
- No inline editing or row-click actions — view-only

### Claude's Discretion

- Loading skeleton design for each panel while data loads
- Exact spacing, padding, and typography sizing within each panel
- Empty state messaging when no transactions or categories exist yet
- Error state handling per panel (individual panel errors vs full-page error)
- How the per-account breakdown in the hero section handles many accounts (scroll, collapse, etc.)
- Whether income/expense amounts show percentage of total or just raw numbers
- Animation/transitions when data loads

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The dashboard should follow the existing Lovecraftian + retro-2000s visual patterns already established in the app (dark green theme, Cinzel Decorative headers, Share Tech Mono for UI text, JetBrains Mono for financial numbers).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 05-dashboard_
_Context gathered: 2026-03-01_
