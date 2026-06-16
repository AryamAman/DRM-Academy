# DRM Trading Academy — Design System

Single source of truth for all visual tokens, layout rules, and component patterns.
Any UI change must be consistent with or must update this file.

---

## Mood & Direction

Dark, high-density, financial terminal aesthetic. Content-first — no decorative chrome.
Every interactive element must feel responsive and precise. Charts and numbers are the hero.

---

## Color Tokens

All tokens are CSS custom properties on `:root`.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0b0e14` | Page background (darkest) |
| `--bg2` | `#111522` | Sidebar / canvas backgrounds |
| `--panel` | `#161b2c` | Card surfaces |
| `--panel2` | `#1c2238` | Inset surfaces, inputs, stat blocks |
| `--border` | `#262d45` | All borders and dividers |
| `--text` | `#e6e9f2` | Primary text |
| `--muted` | `#8a93ad` | Secondary / label text |
| `--accent` | `#4f8cff` | Primary interactive color (links, active states, focus) |
| `--accent2` | `#7c5cff` | Gradient pair for accent (always used with `--accent`) |
| `--green` | `#22c47e` | Profit, bullish, success, done |
| `--red` | `#f4515c` | Loss, bearish, error, warning |
| `--amber` | `#f5a623` | Neutral market view, caution, T+0 curve |
| `--cyan` | `#2dd4bf` | Code, mono values, volatility/income |

### Semantic usage
- **Bull bias** → `--green` (bg at 15% opacity)
- **Bear bias** → `--red` (bg at 15% opacity)
- **Neutral/range** → `--amber` (bg at 15% opacity)
- **Vol play** → `--accent2` (bg at 18% opacity)
- **Income trade** → `--cyan` (bg at 15% opacity)
- **Positive P&L** → `.pos` class (`--green`, monospace)
- **Negative P&L** → `.neg` class (`--red`, monospace)

---

## Typography

| Token | Value |
|-------|-------|
| `--font` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif` |
| `--mono` | `"SF Mono", ui-monospace, Menlo, Consolas, monospace` |
| Base size | `15px` |
| Base line-height | `1.6` |

### Type Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| `h1` (hero) | 28px | 700 | Page titles inside `.hero` |
| `h1` | 26px | 700 | Standard page title |
| `h2` | 19px | 700 | Section heading, has bottom border |
| `h3` | 16px | 700 | Sub-section |
| `p` | 15px | 400 | Color `#c6cce0` (slightly dimmer than `--text`) |
| `.lead` | 15px | 400 | `--muted`, used for page sub-headings |
| `.nav-group` | 10.5px | 400 | ALL CAPS, `1.2px` letter-spacing |
| `.nav-item` | 13.5px | 400 | |
| `.brand-name` | 16px | 700 | `0.2px` letter-spacing |
| `.brand-sub` | 11px | 400 | `--muted` |
| `code`, `.mono` | 13px | 400 | `--cyan`, `--panel2` background |
| `.stat .v` | 17px | 600 | Monospace, stat block values |
| `.stat .k` | 11px | 600 | ALL CAPS, `0.6px` letter-spacing |

---

## Spacing & Radius

| Token | Value |
|-------|-------|
| `--radius` | `12px` |
| Card padding | `18px 20px` |
| Sidebar padding | `18px 12px` |
| Main padding (desktop) | `32px 40px 80px` |
| Main padding (tablet) | `20px` |
| Main padding (mobile) | `68px 16px 80px` (top accounts for nav toggle) |
| Main max-width | `1120px` |
| Section spacing (`h2` margin) | `30px 0 12px` |

---

## Layout

### Shell
```
┌──────────────────────────────────────────────────┐
│  .sidebar (264px fixed)  │  .main (flex:1)        │
│  sticky, full height     │  max-width 1120px       │
└──────────────────────────────────────────────────┘
```

### Sidebar
- Width: `264px`, `flex-shrink: 0`
- Background: `--bg2`
- Right border: `1px solid --border`
- Internal structure: brand → `<nav>` → resources → footer
- Footer contains progress bar + "Made with ❤️ by Aryam"

### Responsive breakpoints

| Breakpoint | Behavior |
|-----------|---------|
| `≤ 980px` | `.grid2`, `.grid3` collapse to single column; main padding reduces |
| `≤ 720px` | Sidebar becomes a fixed drawer (off-screen left); ☰ toggle appears top-left; overlay covers content |

### Mobile drawer
- Sidebar: `position:fixed`, `transform: translateX(-100%)` when closed
- Opens with `.open` class → `transform: translateX(0)`
- Transition: `0.25s ease`
- Overlay: `rgba(0,0,0,.55)` + `backdrop-filter: blur(2px)`
- Clicking overlay or any nav item closes the drawer

---

## Components

### `.card`
Base surface. Always `--panel` background, `--border` border, `--radius` radius, `18px 20px` padding.

Variants (left accent border `3px`):
- `.card.tip` → `--green`
- `.card.warn` → `--red`
- `.card.note` → `--amber`

### `.pill` (badges)
Inline, `border-radius: 999px`, `11.5px` bold text.

| Class | Color |
|-------|-------|
| `.pill.bull` | `--green` |
| `.pill.bear` | `--red` |
| `.pill.neutral` | `--amber` |
| `.pill.vol` | `#a98eff` (accent2-tinted) |
| `.pill.income` | `--cyan` |
| `.pill.gray` | `--muted` on `--panel2` |

### `.btn`
Primary: gradient `--accent → --accent2`, white text, `border-radius: 8px`, `9px 18px` padding, `14px 600`.
Ghost: `.btn.ghost` — `--panel2` bg, `--border` border, `--text` color.
Small: `.btn.sm` — `5px 12px`, `12.5px`.
Hover: `filter: brightness(1.1)`.

### `.stat` / `.stat-row`
Financial metric block. Flex row, wraps. Each `.stat`: `--panel2`, `--border`, `10px` radius, `10px 16px`.
- `.k` — label (11px, uppercase, `--muted`)
- `.v` — value (17px, monospace, 600)

### `.legs-box`
Monospace display of option legs. `--bg2` background, `1px dashed --border`, shows buy legs in `--green`, sell legs in `--red`.

### `.filter-bar` / `.fbtn`
Pill-shaped filter buttons. Default: `--panel2`. Active: `--accent` border, `rgba(79,140,255,.18)` background, white text.

### `.strat-card`
Strategy grid card. `--panel`, `10px` radius, hover lifts `translateY(-2px)` and accents border.

### `.candle-card`
Candlestick pattern card. Same surface as `.strat-card`. Contains SVG chart (`100% × 110px`), title, and description.

### `.quiz-opt`
Answer buttons. `--panel2`, 8px radius. Reveals `.correct` (green) or `.wrong` (red) on selection.

### `.hero`
Home page hero box. Gradient from `rgba(--accent, .14)` to `rgba(--accent2, .10)`, `rgba(--accent, .3)` border, `16px` radius.

### Canvas charts (`.chart`)
`--bg2` background, `--border`, `--radius`. Two data series:
- Expiry payoff → `--accent` (blue)
- T+0 mark-to-market → `--amber` (orange, dashed)
- Breakeven dots → `--muted`
- Profit fill → `rgba(--green, .15)`
- Loss fill → `rgba(--red, .12)`

### Toast
Fixed bottom-right. `--panel` bg, `--green` border, fades in/out with `translateY` transition.

### Navigation
- Group headers: `.nav-group` — uppercase, 10.5px, `--muted`
- Items: `.nav-item` — 8px radius, transparent border default
- Active: `linear-gradient(90deg, rgba(--accent,.16), rgba(--accent2,.10))`, `rgba(--accent,.35)` border
- Done tick: `--green` ✓ pushed to the right

---

## Interactive Controls

### Range sliders
Full width, `accent-color: --accent`. Labels 12px `--muted`; live value shown in `--cyan` monospace.

### Inputs / Selects
`--panel2` background, `--border` border, `8px` radius, `14px` text, monospace for number inputs.
Focus: `border-color: --accent`, no outline.

### Progress bar
`6px` height, `--panel2` track, `linear-gradient(90deg, --accent, --accent2)` fill, animated `width` transition `0.4s`.

---

## Rules

1. Never use white or light backgrounds — the entire UI is dark-first.
2. Numbers always use `--mono` font. Financial values use `.pos` / `.neg`.
3. Gradient always goes `--accent → --accent2` (left to right, 135°).
4. Borders never exceed `1px` solid — except card accent variants which use `3px left`.
5. Hover states use either `background: --panel` or `border-color: --accent` — never both plus a shadow.
6. Charts are always on `--bg2` canvas backgrounds, never on `--panel`.
7. Mobile breakpoint is `720px` — not `768px`. Don't change this without updating the toggle logic.
8. "Made with ❤️ by Aryam" credit appears in two places: sidebar bottom (10px, 45% opacity) and page footer (11px, 40% opacity, right-aligned).
