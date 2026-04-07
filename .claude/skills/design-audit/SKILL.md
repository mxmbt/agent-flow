---
name: design-audit
description: "Design Audit: 80-item checklist + AI Slop Detection → Score A-F."
---

# Design Audit

## Роль
Page-by-page visual audit. 10 категорий, ~80 пунктов.
Score each category A-F. Compute weighted Design Score + AI Slop Score.

## Когда вызывается
Для любого UI — standalone или как часть workflow. Page-by-page аудит визуального качества.

## Гайды (прочитать перед аудитом)
- `docs/design/DESIGN-SYSTEM.md` — DS source of truth
- `docs/design/UX-WRITING-GUIDE.md` — copy source of truth

## Чеклист по категориям

### 1. Visual Hierarchy & Composition (8 criteria)
- Clear focal point on each page
- Intentional eye travel path
- Whitespace purposefully used
- Visual weight balanced
- Content density appropriate
- Information hierarchy clear (primary/secondary/tertiary)
- Alignment grid consistent
- Section rhythm varied (not cookie-cutter same height)

### 2. Typography (15 criteria)
- Font count ≤3
- Type scale ratio consistent (1.2-1.5x between levels)
- Line height: body 1.4-1.6, headings 1.1-1.3
- Measure (line length): 45-80 characters for body
- No blacklisted fonts (Papyrus, Comic Sans, Impact)
- Headings visually distinct from body
- Weight contrast meaningful
- Consistent text alignment
- No orphans/widows in key areas
- Caption/small text legible
- Font loading strategy (no FOUT/FOIT)
- Letter-spacing appropriate per size
- Paragraph spacing consistent
- List styling consistent
- Code/monospace font readable

### 3. Color & Contrast (10 criteria)
- WCAG AA contrast ratios (4.5:1 normal text, 3:1 large)
- Semantic color consistency (error=red, success=green across app)
- Color not sole indicator (icons/text accompany)
- Dark mode support (if applicable)
- Brand colors used consistently
- Accent color draws attention to right things
- Neutral palette harmonious
- No jarring color transitions between sections
- Link color distinguishable from body text
- Selection/highlight color appropriate

### 4. Spacing & Layout (12 criteria)
- Consistent spacing scale (4px/8px/16px/24px/32px/48px/64px)
- Grid alignment across pages
- Component internal padding consistent
- Gap between related items < gap between unrelated
- Responsive breakpoints smooth
- No content overlaps at any viewport
- Safe area/notch awareness (mobile)
- Scroll behavior intentional
- Sticky elements don't overlap content
- Footer positioning appropriate
- Sidebar/main proportions balanced
- Card/list spacing rhythmic

### 5. Interaction States (10 criteria)
- Hover state on all clickable elements
- Focus state visible and accessible
- Active/pressed state exists
- Disabled state clearly indicates non-interactivity
- Loading state for async operations
- Empty state with guidance
- Error state with actionable message
- Success state confirmation
- Selected/active state in navigation
- Transition between states smooth (150-300ms)

### 6. Responsive Design (8 criteria)
- Mobile-first approach evidence
- Touch targets ≥44px on mobile
- No horizontal scroll on any viewport
- Images responsive (srcset or CSS)
- Navigation adapts gracefully
- Tables/data adapt to narrow screens
- Modal/dialog usable on mobile
- Text readable without zoom on mobile

### 7. Motion & Animation (6 criteria)
- Animations serve purpose (not decorative)
- Duration appropriate (150-500ms for UI, longer for content)
- Easing curves natural (not linear)
- prefers-reduced-motion respected
- No animation jank (60fps)
- Loading animations informative

### 8. Content & Microcopy (8 criteria)
- Button labels action-oriented
- Error messages explain + suggest fix
- Empty states guide user to action
- Tooltips concise (≤80 chars)
- Placeholder text helpful (not "Enter text here")
- Confirmation dialogs clear about consequences
- Progress indicators show completion
- Notifications timely and dismissible

### 9. AI Slop Detection (10 anti-patterns)
**Flag ANY of these — they signal generic AI-generated design:**
- Purple/blue gradients as primary design element
- Three-column feature grid with icon + heading + text
- Icons in colored circles as primary visual treatment
- Everything centered with no intentional asymmetry
- Uniform bubbly border-radius on everything
- Decorative gradient blobs/orbs as background
- Emoji as primary design element
- Colored left-border on cards as sole differentiation
- Generic hero copy ("Unlock the power of...")
- Cookie-cutter section rhythm (same height, same layout, repeating)

### 10. Performance as Design (6 criteria)
- Largest Contentful Paint <2.5s
- No layout shift during load
- Images optimized (WebP/AVIF, lazy loaded)
- Fonts subset appropriately
- Above-fold content prioritized
- Skeleton screens match actual layout

### 11. UX Architecture Anti-Patterns (5 criteria)
**Flag these — structural UX problems, not visual defects:**
- Tab overuse: related data split into tabs forcing memory between views (tabs OK for mode switching: Edit/Preview/Published)
- Settings sprawl: all settings in flat list without task-based grouping
- Equal visual weight: all elements same size/weight — user can't identify priorities
- Context switching: completing one task requires navigating between 2+ pages when inline/drawer would suffice
- Over-reliance on tables: data shown as table when trend/comparison/timeline would be clearer

## Дополнительные reference files

При необходимости обоснования findings прочитай:
- `audit-dimensions.md` (рядом) — 8 UX dimensions с severity criteria и common findings
- `ux-principles.md` (рядом) — теоретическая база: F-pattern, Gestalt, Miller's Law, Shneiderman

## Scoring

Per category: A (≥90%) / B (80-89%) / C (70-79%) / D (60-69%) / F (<60%)
Each high-impact finding: drop one letter
Each medium finding: drop half letter

**Design Score:** Weighted average (equal weights across categories 1-8, 10)
**AI Slop Score:** Category 9 standalone. A = 0 patterns found, F = 5+ patterns

## Output
Include in AGENT_REPORT:
- `designScore`: A-F
- `aiSlopScore`: A-F
- `findings`: list of issues with category, severity, description
