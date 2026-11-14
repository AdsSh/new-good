# PermitFlow Design System

A production-quality UI/UX system for a Lagos State building permit consulting application.

**Design Principles:** Professional, credible, modern, calm, trustworthy. Appropriate for planning, property, and consultancy work.

---

## 1. Colors

### Brand Palette

| Token | Hex | Role |
|-------|-----|------|
| `primary` | `#148E80` | Brand teal — CTAs, links, active states, icons |
| `primary-dark` | `#0F6B61` | Darker teal — hover states for primary elements |
| `accent-dark` | `#0B1120` | Near-black navy — dark backgrounds, navbar, footer |
| `surface-light` | `#FFFFFF` | White — card surfaces, modals |
| `surface-dark` | `#1F2937` | Dark gray — card surfaces in dark mode |

### Page Backgrounds

| Context | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Body | `#FAFAFA` | `#0B1120` |
| Card surface | `#FFFFFF` | `#1F2937` or `#161F30` |
| Modal surface | `#FFFFFF` | `#0F172A` |

### Semantic Colors

Used for status indicators, badges, and alerts.

| Semantic | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| **Approved / Success** | `emerald-50` bg, `emerald-600`/`emerald-700` text | `emerald-950/40` bg, `emerald-300`/`emerald-400` text | Approved permits, completed tasks, WhatsApp |
| **In Review / Warning** | `amber-50` bg, `amber-600`/`amber-700` text | `amber-950/40` bg, `amber-300`/`amber-400` text | Pending review, caution states |
| **Action Required / Error** | `rose-50` bg, `rose-600`/`rose-700` text | `rose-950/40` bg, `rose-300`/`rose-400` text | Urgent items, queries, errors |
| **Submitted** | `indigo-50` bg, `indigo-600` text | `indigo-950/40` bg, `indigo-400` text | Submitted to authority |
| **Documents Received** | `blue-50` bg, `blue-600`/`blue-700` text | `blue-950/40` bg, `blue-400` text | Document intake |
| **Info / Teal accent** | `teal-50` bg, `teal-500`/`teal-600` text | `teal-950/40` bg, `teal-300`/`teal-400` text | Informational badges |

### Document Type Colors

| Type | Light | Dark |
|------|-------|------|
| CAD Blueprint | `blue-100` bg, `blue-700` text | `blue-950/60` bg, `blue-400` text |
| Survey Plan | `amber-100` bg, `amber-700` text | `amber-950/60` bg, `amber-400` text |
| Structural Calc | `purple-100` bg, `purple-700` text | `purple-950/60` bg, `purple-400` text |
| Generic Document | `gray-100` bg, `gray-600` text | `gray-800` bg, `gray-300` text |

### Gray Scale (Text & Borders)

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Primary text | `gray-900` | `white` / `gray-100` |
| Secondary text | `gray-500` / `gray-600` | `gray-400` |
| Muted text | `gray-400` | `gray-500` |
| Borders | `gray-200/80` | `gray-800` |
| Subtle borders | `gray-100` | `gray-800/80` |
| Input backgrounds | `gray-50` | `gray-900` |

### Overlay Colors

| Context | Class |
|---------|-------|
| Modal backdrop | `bg-black/50` |
| Heavy overlay (document viewer) | `bg-black/80` |
| Mobile nav backdrop | `bg-black/70 backdrop-blur-md` |

---

## 2. Typography

### Font Family

**Inter** — loaded via Google Fonts CDN. Applied globally via `font-sans`.

Weights loaded: 300, 400, 500, 600, 700

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Micro | 8px (`text-[8px]`) | normal | bold | Comment timestamps |
| Tiny | 9px (`text-[9px]`) | normal | black (900) | Mini badges, category labels, officer roles |
| Mini | 10px (`text-[10px]`) | normal | bold / black | Secondary labels, saved indicators, price subtitles |
| XS | 12px (`text-xs`) | relaxed | bold / medium | Buttons, input text, small labels, descriptions |
| SM | 14px (`text-sm`) | relaxed | bold / medium | Body text, paragraph content, form labels |
| Base | 16px (`text-base`) | normal | bold / semibold | Standard body, button text |
| LG | 18px (`text-lg`) | tight | bold | Subheadings, card titles |
| XL | 20px (`text-xl`) | tight | bold | Section subheadings |
| 2XL | 24px (`text-2xl`) | tight | extrabold | Page titles, section headings |
| 3XL | 30px (`text-3xl`) | tight | extrabold | Large headings, hero text (mobile) |
| 4XL | 36px (`text-4xl`) | tight | extrabold | Hero headings (sm+) |
| 5XL | 48px (`text-5xl`) | tight | extrabold | Hero headings (md+) |
| 6XL | 60px (`text-6xl`) | tight | extrabold | Hero headings (lg+) |

### Font Weights

| Weight | Class | Usage |
|--------|-------|-------|
| Light (300) | `font-light` | Hero subtitle text |
| Normal (400) | default | Body text |
| Medium (500) | `font-medium` | Secondary labels, meta text |
| Semibold (600) | `font-semibold` | Nav links, filter buttons |
| Bold (700) | `font-bold` | Buttons, headings, card titles, form labels |
| Extrabold (800) | `font-extrabold` | Page titles, hero h1, stat numbers |
| Black (900) | `font-black` | Badge labels, uppercase micro text, stat cards |

### Letter Spacing

| Pattern | Class | Usage |
|---------|-------|-------|
| Tight | `tracking-tight` | Headings, hero text |
| Normal | default | Body text |
| Wide | `tracking-wide` | Sub-labels, meta |
| Wider | `tracking-wider` | Nav labels, category labels |
| Widest | `tracking-widest` | Badge text, section category labels |

### Text Transform

- `uppercase` — section labels, badge text, category labels, navigation labels, micro text

### Line Height

| Pattern | Class | Usage |
|---------|-------|-------|
| Tight | `leading-tight` | Headings, hero text |
| Snug | `leading-snug` | Card titles, compact text |
| Normal | default | Body |
| Relaxed | `leading-relaxed` | Descriptions, paragraphs, card body text |

---

## 3. Spacing Scale

### Padding

| Value | Pixels | Common Usage |
|-------|--------|--------------|
| `p-1.5` | 6px | Small badges, mini buttons |
| `p-2` | 8px | Compact cards, inner spacing |
| `p-2.5` | 10px | Button inner padding, mini elements |
| `p-3` | 12px | Card items, nav button height |
| `p-3.5` | 14px | WhatsApp buttons, form elements |
| `p-4` | 16px | Mobile menu links, task items, stat cards |
| `p-5` | 20px | Mobile drawer header, dashboard project cards |
| `p-6` | 24px | Card padding, dashboard sections |
| `p-7` | 28px | Info cards |
| `p-8` | 32px | Large cards, about page cards, dashboard panels |
| `p-10` | 40px | Large card variants |

### Margin (Vertical Rhythm)

| Value | Pixels | Usage |
|-------|--------|-------|
| `mb-1` | 4px | Tiny gaps between related elements |
| `mb-1.5` | 6px | Between closely related elements |
| `mb-2` | 8px | Small separations |
| `mb-3` | 12px | Card internal spacing |
| `mb-4` | 16px | Section internal spacing |
| `mb-5` | 20px | Between subsections |
| `mb-6` | 24px | Section separators |
| `mb-8` | 32px | Major section spacing |
| `mb-10` | 40px | Section-to-section |
| `mb-12` | 48px | Page section margins |
| `mb-16` | 64px | Major page sections |

### Page-Level Padding

| Context | Class | Value |
|---------|-------|-------|
| Page top (below fixed nav) | `pt-24 sm:pt-28` | 96px / 112px |
| Page bottom | `pb-24` | 96px |
| Section vertical | `py-16 sm:py-20` | 64px / 80px |

### Gap Scale

| Value | Pixels | Usage |
|-------|--------|-------|
| `gap-0.5` | 2px | Tight inline elements |
| `gap-1` | 4px | Icon + text pairs |
| `gap-1.5` | 6px | Button icon gaps, filter chips |
| `gap-2` | 8px | Inline flex items, form rows |
| `gap-2.5` | 10px | Option button gaps |
| `gap-3` | 12px | Flex containers, filter rows |
| `gap-4` | 16px | Grid gaps, flex containers |
| `gap-5` | 20px | Medium grid gaps |
| `gap-6` | 24px | Large grid gaps (desktop) |
| `gap-8` | 32px | XL grid gaps |

---

## 4. Layout

### Container Widths

| Token | Max Width | Class | Usage |
|-------|-----------|-------|-------|
| Content | 1280px | `max-w-7xl` | Main page container (all pages) |
| Narrow | 896px | `max-w-4xl` | Process timeline, CTA sections |
| Paragraph | 672px | `max-w-2xl` | Body text, descriptions |
| Centered | 448px | `max-w-md` | 404 page, error boundary |

All pages use: `mx-auto px-4 sm:px-6 lg:px-8`

### Grid Patterns

| Pattern | Usage |
|---------|-------|
| `grid-cols-1 md:grid-cols-2` | Solutions cards, mission/vision, task grid |
| `grid-cols-1 md:grid-cols-3` | Core values, features, team, testimonials |
| `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` | Service cards, project card grid |
| `grid-cols-1 md:grid-cols-4` | Hero stats, footer columns |
| `grid-cols-2 lg:grid-cols-4` | Dashboard stat cards |
| `grid-cols-1 sm:grid-cols-2` | Task grid, document grid |
| `grid-cols-1 lg:grid-cols-3` | Dashboard detail layout (2-col main + 1-col sidebar) |

### Section Spacing

Sections within a page use `space-y-8 sm:space-y-12` or `space-y-6 sm:space-y-8` for vertical rhythm.

---

## 5. Responsive Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| Default | 0px | Mobile portrait |
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large desktop |

### Responsive Patterns

- **Text:** `text-2xl sm:text-3xl lg:text-4xl` (progressive enhancement)
- **Padding:** `p-5 sm:p-8 lg:p-10` (more space on larger screens)
- **Grid:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (stack → 2-col → 3-col)
- **Flex direction:** `flex-col sm:flex-row` (stack horizontal on small screens)
- **Hidden/Visible:** `hidden sm:flex`, `sm:hidden`

---

## 6. Border Radius

| Token | Class | Usage |
|-------|-------|-------|
| Pill | `rounded-full` | Pill buttons, avatars, status dots, progress rings |
| Large | `rounded-3xl` | Primary card radius (dominant pattern) |
| Medium | `rounded-2xl` | Secondary cards, project cards, inner containers |
| Standard | `rounded-xl` | Buttons, inputs, nav items, badges, form fields |
| Small | `rounded-lg` | Micro badges, inline elements |
| Minimal | `rounded-md` | Tiny badges, count indicators |
| Checkbox | `rounded-md` | Task checkboxes |

---

## 7. Shadows

| Token | Class | Usage |
|-------|-------|-------|
| Subtle | `shadow-sm` | Default card shadow, outline buttons |
| Standard | `shadow-md` | Elevated buttons, active cards |
| Strong | `shadow-lg` | Primary CTA buttons, hero elements |
| Modal | `shadow-xl` | Dropdown menus, floating elements |
| Heavy | `shadow-2xl` | Modal dialogs |
| Colored | `shadow-primary/20` | Primary button glow, active states |

---

## 8. Buttons

### Primary CTA

```
bg-primary hover:bg-primary-dark text-white
px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm
shadow-lg shadow-primary/20
hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]
transition-all
```

**Usage:** Main call-to-action on all pages, form submissions, primary actions.

### Secondary (Light)

```
bg-white hover:bg-gray-100 text-gray-900
px-6 py-3.5 rounded-xl font-bold text-sm shadow-xl
```

**Usage:** Alternative CTA alongside primary, less emphasis actions.

### Ghost (Translucent)

```
bg-white/10 hover:bg-white/20 text-white
border border-white/20 rounded-xl font-bold
backdrop-blur-sm
```

**Usage:** Actions over hero images or dark backgrounds.

### Outline

```
bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
border border-gray-200 dark:border-gray-700 rounded-xl font-bold
hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm
```

**Usage:** Secondary actions, "Learn More" links, cancel actions.

### WhatsApp

```
bg-emerald-600 hover:bg-emerald-700 text-white
px-5 py-3 rounded-xl font-bold text-sm shadow-md
```

**Usage:** All WhatsApp contact actions. Includes WhatsApp SVG icon.

### Small Action

```
bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300
border border-emerald-200 dark:border-emerald-800
px-2.5 py-2 rounded-xl text-xs font-bold
```

**Usage:** Inline actions on cards (WhatsApp per-file, inspect buttons).

### Filter Pill

```
px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all
Active: bg-{color}-600 text-white shadow-sm
Inactive: bg-{color}-50/80 dark:bg-{color}-950/40 text-{color}-700 dark:text-{color}-300
          border border-{color}-200/80 dark:border-{color}-900/50
```

**Usage:** Status filter tabs in dashboard.

### Pill Option (Onboarding)

```
px-4 sm:px-5 py-2.5 rounded-full border-2 text-xs sm:text-sm transition-all
Active: bg-primary/10 border-primary text-primary font-bold shadow-sm
Inactive: border-gray-200 dark:border-gray-700 hover:border-primary
          text-gray-700 dark:text-gray-300
```

**Usage:** Selection options in onboarding wizard.

### Button Sizes

| Size | Padding | Text | Usage |
|------|---------|------|-------|
| Small | `px-3 py-1.5` | `text-xs` | Inline actions, filter chips |
| Standard | `px-4 sm:px-5 py-2.5 sm:py-3` | `text-xs sm:text-sm` | Most buttons |
| Large | `px-6 py-3.5` | `text-sm` | Primary CTAs, form submissions |

---

## 9. Form Fields

### Text Input

```
w-full px-5 py-3.5 rounded-xl
border border-gray-200 dark:border-gray-700
bg-gray-50 dark:bg-gray-900
text-gray-900 dark:text-white text-sm
placeholder:text-gray-400
focus:border-primary focus:ring-2 focus:ring-primary/10
transition-all outline-none
```

### Select Dropdown

```
w-full px-5 py-3.5 rounded-xl
border border-gray-200 dark:border-gray-700
bg-gray-50 dark:bg-gray-900
text-gray-900 dark:text-white text-sm
focus:border-primary transition-all outline-none
appearance-none cursor-pointer
```

### Search Input

```
w-full pl-9 pr-8 py-2
bg-gray-50 dark:bg-gray-900
border border-gray-200 dark:border-gray-700
rounded-xl text-xs font-medium
focus:border-primary focus:ring-1 focus:ring-primary
outline-none text-gray-900 dark:text-white
placeholder:text-gray-400 transition-all
```

### Textarea

```
w-full px-3.5 py-2.5 text-xs
text-gray-800 dark:text-gray-200
bg-gray-50 dark:bg-gray-900/60
hover:bg-white dark:hover:bg-gray-900
focus:bg-white dark:focus:bg-gray-900
border border-gray-200 dark:border-gray-700
rounded-xl
focus:border-primary focus:ring-1 focus:ring-primary
outline-none resize-none transition-all
placeholder:text-gray-400 dark:placeholder:text-gray-500
font-sans leading-relaxed
```

### Form Label

```
block text-xs font-bold uppercase tracking-widest
text-gray-500 dark:text-gray-400 mb-2
```

### Input States

| State | Visual |
|-------|--------|
| Default | `bg-gray-50 border-gray-200` |
| Focus | `border-primary ring-2 ring-primary/10` |
| Error | `border-red-500 ring-2 ring-red-500/10` |
| Disabled | `opacity-50 cursor-not-allowed` |

---

## 10. Cards

### Standard Card

```
bg-white dark:bg-[#161F30] rounded-3xl p-6 sm:p-8
border border-gray-200/80 dark:border-gray-800 shadow-sm
```

**Usage:** Content sections, feature cards, process steps, about page cards.

### Dashboard Panel Card

```
bg-white dark:bg-surface-dark rounded-3xl p-6 sm:p-8
border border-gray-200/80 dark:border-gray-800 shadow-sm
```

**Usage:** Dashboard sections (timeline, tasks, documents, sidebar).

### Interactive Card (Project Card)

```
rounded-2xl p-5 border transition-all cursor-pointer
Active: border-primary ring-2 ring-primary/20 bg-white dark:bg-surface-dark shadow-md
Inactive: border-gray-200/80 dark:border-gray-800 bg-white dark:bg-surface-dark
          hover:border-primary/40 hover:shadow-sm
```

**Usage:** Project list items in dashboard grid.

### Stat Card

```
p-4 sm:p-5 rounded-2xl border text-left transition-all relative overflow-hidden group
Active: bg-{color}-50/{opacity} dark:bg-{color}-950/{opacity} border-{color}-400 shadow-sm ring-2 ring-{color}-500/10
Inactive: bg-white dark:bg-surface-dark border-gray-200/80 dark:border-gray-800/80
          hover:border-{color}-200 dark:hover:border-{color}-900/40
```

**Usage:** Dashboard KPI stat cards.

### Card Padding Scale

| Size | Class | Usage |
|------|-------|-------|
| Compact | `p-4 sm:p-5` | Stat cards, small items |
| Standard | `p-5 sm:p-8` | Project cards, dashboard sections |
| Large | `p-6 sm:p-8 lg:p-10` | Full-width panels, timeline |

---

## 11. Modals

### Backdrop

```
fixed inset-0 z-[200] flex items-center justify-center p-4
bg-black/50 backdrop-blur-xs animate-fade-in
```

### Modal Panel

```
bg-white dark:bg-surface-dark rounded-3xl
max-w-lg w-full p-6 sm:p-8
shadow-2xl border border-gray-200 dark:border-gray-800
animate-fade-in-up flex flex-col max-h-[90vh]
```

### Full-Screen Modal (Document Viewer)

```
fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-4 lg:p-6
bg-black/80 backdrop-blur-sm animate-fade-in select-none
```

### Mobile Navigation Drawer

```
fixed inset-y-0 right-0 w-full max-w-sm
bg-white dark:bg-[#0B1120]
border-l border-gray-200 dark:border-gray-800 shadow-2xl
animate-slide-in-right
```

### Z-Index Scale

| Layer | Z-Index | Usage |
|-------|---------|-------|
| Base | 0 | Default |
| Navbar | 50 | Fixed top navigation |
| WhatsApp FAB | 60 | Floating action button |
| Confetti canvas | 120 | Celebration animation |
| Modal | 200 | Assignment, upload confirmation |
| Document viewer | 220 | Full-screen document viewer |
| Toast | 210 | Notification toasts |

---

## 12. Badges

### Status Badge (Project Card)

```
text-[10px] font-extrabold uppercase tracking-wider
px-2.5 py-1 rounded-full border
flex items-center gap-1
```

| Status | Colors |
|--------|--------|
| Approved | `bg-emerald-50 text-emerald-700 border-emerald-200/80` |
| Action Required | `bg-rose-50 text-rose-700 border-rose-200/80 animate-pulse` |
| In Review | `bg-amber-50 text-amber-700 border-amber-200/80` |

### Section Category Badge

```
text-xs font-bold uppercase tracking-widest text-primary
bg-primary/10 px-4 py-1.5 rounded-full
```

### Count Badge

```
inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full
text-[10px] font-black bg-emerald-500 text-white shadow-xs
```

### Document Type Badge

```
text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide
```

Colored per document type (see Document Type Colors above).

### Project ID Badge

```
text-[11px] font-black uppercase tracking-wider text-primary
bg-primary/10 px-2 py-0.5 rounded-md
```

---

## 13. Alerts

### Action Required Banner

```
p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40
border border-rose-200 dark:border-rose-800/80
flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
text-rose-900 dark:text-rose-200 animate-fade-in-up
```

### Inline Alert (Card-Level)

```
p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40
border border-rose-200/80 dark:border-rose-900/50
text-[11px] text-rose-800 dark:text-rose-300
flex items-start gap-2
```

### Active Filter Indicator

```
flex items-center justify-between
bg-primary/5 dark:bg-primary/10 border border-primary/20
px-3.5 py-2 rounded-xl text-xs text-primary dark:text-teal-300
```

---

## 14. Status Indicators

### Status Dot (Pulsing)

```
w-2 h-2 rounded-full bg-{color} animate-pulse
```

**Usage:** Active status indicators, live notifications.

### Status Dot (Ping)

```
w-1.5 h-1.5 rounded-full bg-primary animate-ping
```

**Usage:** "Inspecting" indicator on active project card.

### Online Indicator (Avatar)

```
absolute -bottom-0.5 -right-0.5 w-3 h-3
bg-green-500 border-2 border-white dark:border-surface-dark rounded-full
```

**Usage:** Officer online status in team list.

---

## 15. Progress Indicators

### Progress Bar

```
w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden
inner: h-full bg-primary transition-all duration-500 rounded-full
```

**Usage:** Task completion, document upload, milestone progress.

### Task Completion Checkbox

```
w-5 h-5 rounded-md flex items-center justify-center border transition-all
Completed: bg-primary border-primary text-white
Incomplete: border-gray-300 dark:border-gray-600 hover:border-primary
```

### Step Indicator (Stepper)

```
w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl
flex items-center justify-center border-2 sm:border-4 transition-all duration-300
Current: bg-primary border-primary text-white shadow-lg ring-4 ring-primary/10 scale-105
Completed: bg-primary border-primary text-white
Upcoming: bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600
```

---

## 16. Timeline Components

### LASPPPA Processing Stepper

5-stage horizontal stepper with connector line.

```
Connector: absolute top-6 sm:top-8 left-4 right-4 h-1.5
           bg-gray-100 dark:bg-gray-800 rounded-full z-0 overflow-hidden
Fill:      h-full bg-primary transition-all duration-[1200ms] ease-out rounded-full
```

Stage nodes display icon, label below (hidden on mobile, shown on sm+).

### Vertical Timeline (Process Page)

Standard vertical line with step indicators:
```
step-connector::after { top: 1.25rem; left: 50%; height: 2px; bg-gray-200 }
step-connector-active::after { bg-primary }
```

---

## 17. Navigation

### Top Navbar

```
fixed top-0 left-0 right-0 z-50
bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md
border-b border-gray-200/80 dark:border-gray-800/80
transition-all duration-300
```

Height: ~64px (py-3 with content)

### Nav Links

```
text-sm font-semibold text-gray-700 dark:text-gray-300
hover:text-primary dark:hover:text-primary transition-colors
```

Active link: `text-primary font-bold`

### Nav CTA Button

```
bg-primary hover:bg-primary-dark text-white
px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm
```

### Mobile Menu Toggle

```
p-2 rounded-xl text-gray-600 dark:text-gray-300
hover:bg-gray-100 dark:hover:bg-gray-800
```

Visible: `lg:hidden`
Hidden: `hidden lg:flex`

---

## 18. Mobile Navigation

### Full-Screen Overlay

```
fixed inset-0 z-50 lg:hidden animate-fade-in
Backdrop: fixed inset-0 bg-black/70 backdrop-blur-md
```

### Slide-In Panel

```
fixed inset-y-0 right-0 w-full max-w-sm
bg-white dark:bg-[#0B1120]
border-l border-gray-200 dark:border-gray-800 shadow-2xl
animate-slide-in-right
flex flex-col
```

### Mobile Menu Links

```
flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold
text-gray-700 dark:text-gray-300
hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-all
```

Active: `bg-primary/10 text-primary`

### Mobile Menu Footer

固定底部 WhatsApp button with gradient background.

---

## 19. Loading States

### Skeleton / Shimmer

```
shimmer-bg class:
background: linear-gradient(90deg, transparent, rgba(20, 142, 128, 0.05), transparent);
background-size: 200% 100%;
animation: shimmer 3s infinite;
```

**Usage:** Initial data loading placeholder (when implemented).

### Page Load Animation

```
animate-fade-in-up (0.6s ease-out)
```

Applied to page content containers on mount.

---

## 20. Empty States

### No Projects Found

```
<div className="pt-36 pb-24 text-center px-4 max-w-md mx-auto animate-fade-in-up">
  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 text-primary rounded-2xl
                  flex items-center justify-center mx-auto mb-6">
    <span className="material-icons-outlined text-3xl sm:text-4xl">folder_off</span>
  </div>
  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white
                 tracking-tight mb-3">Title</h2>
  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
    Description text.
  </p>
  <Link className="inline-flex items-center ... bg-primary ...">Action</Link>
</div>
```

### No Filter Results

```
text-center py-12 sm:py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl
border border-dashed border-gray-200 dark:border-gray-800

Icon: w-12 h-12 rounded-2xl bg-gray-200/60 dark:bg-gray-800 text-gray-400
Title: text-base font-bold text-gray-800 dark:text-gray-200
Description: text-xs text-gray-400 mt-1 max-w-sm mx-auto
Action: mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold
```

---

## 21. Error States

### Error Boundary

```
pt-36 pb-24 text-center px-4 max-w-md mx-auto
Icon: w-16 h-16 bg-red-100 text-red-500 rounded-2xl
Title: text-2xl font-extrabold text-gray-900 dark:text-white
Description: text-sm text-gray-500 dark:text-gray-400
Action: bg-red-600 hover:bg-red-700 text-white rounded-xl
```

### 404 Page

```
Large number: text-7xl sm:text-9xl font-black text-primary/20
Title: text-2xl sm:text-3xl font-extrabold
Description: text-sm text-gray-500
Action: bg-primary text-white rounded-xl
```

---

## 22. Confirmation States

### Upload Confirmation Modal

```
Max width: max-w-sm
Title: text-base font-bold text-center
Description: text-gray-500 text-center text-xs
Filename: font-bold text-gray-900 dark:text-white
Actions: flex gap-2.5
  Cancel: flex-1 py-2.5 rounded-xl font-bold text-xs text-gray-500 bg-gray-100
  Confirm: flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-primary
```

### Toast Notification

```
fixed bottom-8 left-1/2 -translate-x-1/2 z-[210] animate-fade-in-up
bg-gray-900 dark:bg-white text-white dark:text-gray-900
px-5 py-3 rounded-2xl shadow-xl
flex items-center gap-3 border border-gray-800 dark:border-gray-200
Icon: material-icons-outlined text-primary text-base
Text: text-xs font-bold tracking-tight
```

Auto-dismiss: 2-3 seconds.

---

## 23. Interaction Patterns

### Transitions

- Universal: `transition-all` on all interactive elements
- Standard duration: default (150ms)
- Slow transitions: `duration-300`, `duration-500` for progress bars
- Stepper: `duration-[1200ms] ease-out` for progress fill

### Hover Effects

- Cards: `hover:border-primary/40 hover:shadow-sm`
- Buttons: `hover:shadow-primary/30 hover:scale-[1.02]`
- Active press: `active:scale-[0.98]`
- Icons: `group-hover:scale-105`

### Focus States

- Inputs: `focus:border-primary focus:ring-2 focus:ring-primary/10`
- Buttons: `focus:outline-none focus:ring-2 focus:ring-primary/20`

### Click Feedback

- Active states: `active:scale-[0.98]` on buttons
- Card selection: `ring-2 ring-primary/20` on active project card

### Scroll Behavior

- Dashboard detail section: `scroll-mt-28` (accounts for fixed navbar)
- Smooth scroll: `scrollIntoView({ behavior: 'smooth', block: 'start' })`

---

## 24. Accessibility Requirements

### Color Contrast

- Primary text (`gray-900` on white): 15.4:1 ratio
- Secondary text (`gray-500` on white): 7.45:1 ratio
- Muted text (`gray-400` on white): 3.94:1 — use only for non-essential labels
- Primary teal (`#148E80` on white): 4.56:1 — meets AA for normal text

### Focus Management

- All interactive elements must be focusable
- Use `outline-none` only when replacing with visible focus ring
- Input focus: `ring-2 ring-primary/10` provides visible indicator
- Button focus: implicit browser focus + ring

### Semantic HTML

- Use `<button>` for actions, `<a>` for navigation
- Use `<label>` with `htmlFor` for form fields
- Use `alt` text on all images
- Use `title` attributes for icon-only buttons

### Keyboard Navigation

- Tab order follows visual order
- Modal close on Escape key (when implemented)
- Enter key submits forms and comments
- Arrow keys navigate within groups (when implemented)

### Motion

- Respect `prefers-reduced-motion` (when implemented)
- Current animations: `fade-in`, `fade-in-up`, `slide-in-right`, `pulse`, `shimmer`
- All animations use ` forwards` fill mode (no reverse on unmount)

### Screen Reader

- Icon-only buttons include `title` or `aria-label`
- Status badges use text content (not just color)
- Form labels are visually hidden but accessible via `htmlFor`

---

## 25. Icons

### Icon Font

**Material Icons Outlined** — loaded via Google Fonts CDN.

```
<span className="material-icons-outlined">{icon_name}</span>
```

### Icon Sizes

| Size | Class | Usage |
|------|-------|-------|
| XS | `text-xs` (~12px) | Inline badge icons |
| Small | `text-sm` (~14px) | Button icons, nav icons |
| Base | `text-base` (~16px) | Card header icons, stat icons |
| Large | `text-lg` (~18px) | Section heading icons |
| XL | `text-3xl` (~30px) | Empty state icons |
| 2XL | `text-4xl` (~36px) | Large empty state icons |

### Common Icons

| Context | Icon |
|---------|------|
| Projects | `folder` |
| In Review | `hourglass_top` |
| Action Required | `warning_amber` |
| Approved | `verified` |
| Documents | `description`, `folder_shared` |
| Tasks | `checklist` |
| Timeline | `architecture`, `account_balance` |
| Notes | `sticky_note_2`, `edit_note` |
| Team | `groups` |
| WhatsApp | Custom SVG (path only) |
| Search | `search` |
| Close | `close` |
| Edit | `edit` |
| Add | `add_circle`, `person_add` |
| Send | `send` |
| Upload | `upload_file` |
| Print | `print` |
| Place | `place` |
| Category | `category` |
| Calendar | `calendar_month` |

---

## 26. Animations

### Custom Keyframes

| Name | Definition | Duration |
|------|-----------|----------|
| `fadeIn` | opacity 0 → 1 | 0.25s ease-out |
| `fadeInUp` | opacity 0, translateY(20px) → opacity 1, translateY(0) | 0.6s ease-out |
| `slideInRight` | opacity 0, translateX(100%) → opacity 1, translateX(0) | 0.3s cubic-bezier(0.16, 1, 0.3, 1) |
| `shimmer` | backgroundPosition -200% → 200% | 2s linear infinite |
| `pulse` | Built-in Tailwind (opacity pulse) | 3s cubic-bezier |

### Animation Classes

| Class | Usage |
|-------|-------|
| `animate-fade-in` | Modal backdrops, overlays |
| `animate-fade-in-up` | Page content, cards, alerts |
| `animate-slide-in-right` | Mobile navigation drawer |
| `animate-pulse` | Live status dots, action required badges |
| `animate-ping` | Active inspecting indicator |
| `animate-pulse-slow` | Slow pulse variant (3s) |

### Confetti Animation

Canvas-based particle system (60 particles) with custom `ConfettiParticle` class. Triggered on task completion.

---

## 27. Scrollbar

```css
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
```

Applied to: modal content areas, long scrollable sections.

---

## 28. Selection

```
selection:bg-primary/20
```

Text selection uses primary teal at 20% opacity.

---

## Appendix: Tailwind Configuration

Defined inline in `index.html` (no separate config file):

```javascript
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#148E80",
        "primary-dark": "#0F6B61",
        "accent-dark": "#0B1120",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1F2937",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    }
  }
}
```

**Plugins:** `forms`, `typography`

**CDNs:**
- Tailwind CSS: `https://cdn.tailwindcss.com?plugins=forms,typography`
- Google Fonts (Inter): `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`
- Material Icons Outlined: `https://fonts.googleapis.com/icon?family=Material+Icons+Outlined`
