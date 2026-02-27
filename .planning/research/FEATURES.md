# Feature Research

**Domain:** offline-first desktop personal finance
**Researched:** 2026-02-27
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Account management (cash/bank/credit card) | Every finance app needs account-level separation and balances | MEDIUM | Depends on account CRUD, currency assignment, soft-delete rules |
| Transaction CRUD (income/expense) | Core user workflow is recording money movement quickly and correctly | HIGH | Requires validation, category/account linkage, deterministic write paths |
| Category hierarchy (income/expense) | Users need meaningful organization and reporting dimensions | MEDIUM | Parent-child tree and safe delete constraints |
| Automatic balance updates | Trust in totals is the baseline expectation in finance software | HIGH | Requires reversible transaction effects for create/update/delete |
| Transaction list with filter/search/sort/pagination | Users expect to inspect history and answer "where did money go?" | MEDIUM | Query composition and indexed search on date/description/category/account |
| Debt/installment tracking for credit cards | Target user explicitly needs quota and card-control visibility | HIGH | Requires debt model, installment progression, payment states |
| Dashboard summary (balance, income vs expense, top categories, recents) | Users expect a quick financial snapshot on entry | MEDIUM | Aggregation queries on transaction data |
| Multi-currency account support and formatting | Multi-currency wallets/cards are common and expected in modern tracking | MEDIUM | Currency metadata, formatting rules, base currency selection |
| Data portability (export/import) | Personal finance users expect ownership and backup of sensitive data | HIGH | Needs schema-versioned JSON, validation, merge/replace safety |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Lovecraft + retro-2000s visual identity | Makes product memorable and portfolio-distinct while staying usable | MEDIUM | Must be consistent across shell, forms, charts, toasts, empty states |
| Custom D3 thematic visualizations (donut, bars, line, treemap) | Moves beyond generic widgets and tells behavior patterns visually | HIGH | Requires custom chart components, theming, interactions, responsive behavior |
| Credit-card utilization + installment projection dashboard | Turns debt tracking into forward-looking risk control, not just history | HIGH | Depends on debt engine plus account credit-limit summaries |
| Intelligent transaction autocomplete (description -> category/amount) | Reduces friction and capture time for repeated spending patterns | MEDIUM | Requires history-frequency model and keyboard-first UX |
| Recurring transaction automation | Improves reliability for predictable monthly/weekly cash flows | HIGH | Needs idempotent generation and date-roll logic |
| Offline-first local-only privacy posture | Strong trust proposition: no mandatory cloud dependency for financial data | MEDIUM | Conflicts with cloud-native features unless optional and isolated |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Mandatory cloud sync/accounts | "Access everywhere" and cross-device convenience | Breaks privacy-first promise, adds auth/conflict complexity, network dependency | Keep local-first; consider optional encrypted backup export first |
| Automatic bank scraping/aggregation in v1 | Reduces manual entry effort | High maintenance, legal/compliance risk, unstable connectors, scope explosion | Start with fast manual capture + import paths; revisit after stable v1 |
| Multi-user/shared ledgers | Useful for couples/teams | Requires permissions, merge/conflict model, larger UX surface | Stay single-user for v1; export/import for handoff use cases |
| Full budgeting-goals engine at launch | Common request in finance products | Adds heavy state/rules before core tracking quality is proven | Deliver robust tracking + debt control first, then add budgets in v2 |
| Real-time external FX APIs by default | "Always latest conversion" | Undermines offline behavior and introduces API reliability cost | Manual FX entry with dated rates; optional fetch integration later |

## Feature Dependencies

```text
[Accounts + Categories]
    └──requires──> [Transaction CRUD Engine]
                       └──requires──> [Deterministic Balance Recalculation]
                                              └──enables──> [Trustworthy Dashboard Aggregations]

[Credit Card Account Type]
    └──requires──> [Debt/Installment Module]
                       └──enables──> [Card Utilization + Payment Projections]

[Transaction History Volume]
    └──enables──> [Autocomplete Suggestions]

[Transaction CRUD Engine]
    └──enables──> [Recurring Transactions Automation]

[Currency Metadata + FX Rates]
    └──requires──> [Consolidated Multi-Currency Balance]

[Offline-First Local-Only]
    └──conflicts──> [Mandatory Cloud Sync / Always-On API Integrations]
```

### Dependency Notes

- **Transaction CRUD Engine requires Accounts + Categories:** transactions cannot be persisted safely without valid account and category references.
- **Deterministic Balance Recalculation requires Transaction CRUD Engine:** balance trust depends on reversible transaction effects during edit/delete flows.
- **Dashboard Aggregations require Deterministic Balances:** summary metrics are only credible if account totals and transaction states are correct.
- **Debt/Installment Module requires Credit Card account type:** debts are anchored to card limits, billing cycles, and utilization metrics.
- **Card Utilization/Projections require Debt engine:** projections need active debts, installment counts, and monthly payment schedules.
- **Autocomplete requires Transaction History volume:** suggestions are low quality until enough historical descriptions exist.
- **Recurring automation requires Transaction CRUD Engine:** generated entries must reuse the same validation and balance update logic.
- **Consolidated balance requires Currency metadata + FX rates:** cross-currency totals are invalid without explicit conversion source data.
- **Offline-first conflicts with mandatory cloud features:** always-on network assumptions undermine core privacy and availability goals.

## MVP Definition

### Launch With (v1)

Minimum viable product - what is needed to validate the concept.

- [ ] Account CRUD with per-account currency and credit-card fields - baseline financial structure
- [ ] Category CRUD with hierarchy - required for meaningful tracking/reporting
- [ ] Transaction CRUD with reliable automatic balance updates - core trust mechanism
- [ ] Transaction table with date/type/account/category filters - practical daily analysis
- [ ] Debt/installment tracking (create debt, pay installment, remaining quotas) - core product value
- [ ] Dashboard summary widgets (balance, period income/expense, top categories, recents) - daily at-a-glance utility
- [ ] Basic multi-currency display + manual FX for consolidated totals - required by project scope
- [ ] Export/import safeguards - ownership, backup, and recovery
- [ ] Cohesive themed shell/navigation - validates identity without blocking usability

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Tags and tag filters - improves organization after base flow is stable
- [ ] Autocomplete with frequency ranking - optimize input speed after enough history exists
- [ ] Recurring transaction rules + startup processor - automation once manual flow is trusted
- [ ] Debt alerts (>80% card utilization) and 6-month projections - stronger proactive planning
- [ ] Full D3 chart pack interactions (drill-down, click-to-filter, animated transitions) - deepen insights
- [ ] Keyboard shortcut layer - productivity optimization after primary UX is proven

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Advanced analytics (heatmap, sankey, deeper trend models) - high effort vs early value
- [ ] Budgeting and savings-goal engine - secondary to transaction/debt correctness
- [ ] Desktop notifications and reminder workflows - useful but non-essential for v1 trust
- [ ] Optional FX API integration - only after offline-first fallback path is mature
- [ ] Optional encrypted sync/replication - only if privacy model remains explicit opt-in

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Transaction CRUD + balance integrity | HIGH | HIGH | P1 |
| Account and category management | HIGH | MEDIUM | P1 |
| Debt/installment lifecycle | HIGH | HIGH | P1 |
| Transaction filtering/search/pagination | HIGH | MEDIUM | P1 |
| Dashboard summary metrics | HIGH | MEDIUM | P1 |
| Multi-currency + manual FX conversion | HIGH | MEDIUM | P1 |
| Export/import with validation modes | MEDIUM | HIGH | P2 |
| D3 themed chart suite | MEDIUM | HIGH | P2 |
| Autocomplete and tags | MEDIUM | MEDIUM | P2 |
| Recurring transactions automation | MEDIUM | HIGH | P2 |
| Advanced visualization set (heatmap/sankey) | LOW | HIGH | P3 |
| Cloud sync/bank aggregation | LOW (for this product vision) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Privacy and deployment model | YNAB: cloud-first SaaS with subscription model | Firefly III / MMEX style tools: self-hosted or local-capable patterns | Strict local desktop default, no mandatory cloud |
| Debt/installment visibility | Many SaaS tools focus more on budgeting than installment mechanics | Local OSS tools often track liabilities but with weaker card-usage UX | Treat installment and card-limit control as first-class workflow |
| Visual identity and dashboard expression | Typical polished but generic fintech UI style | Utility-first UI with limited themed storytelling | Distinct Lovecraft/retro identity plus custom D3 visual narrative |
| Capture speed features | Autocomplete/rules common in mature products | Basic quick-add in many desktop trackers | Add autocomplete + recurring once core correctness is stable |

## Sources

- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/.planning/PROJECT.md`
- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/docs/PROJECT_VISION.md`
- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/docs/FEATURES.md`
- `/home/jacket/PROYECTOS/PERSONALES/Necronomics/docs/ROADMAP.md`
- `/home/jacket/.codex/agents/gsd-project-researcher.md`
- `/home/jacket/.codex/get-shit-done/templates/research-project/FEATURES.md`

---
*Feature research for: Necronomics personal finance desktop domain*
*Researched: 2026-02-27*
