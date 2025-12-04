# Sanctuary OS

A personal energy management dashboard designed for exhausted parents (specifically Jeremy). Built with the "Organic Steel" aesthetic - dark, protective steel textures with soft nebula-blue glows, optimized exclusively for dark mode.

## Core Philosophy

**Anti-productivity guilt.** Match tasks to energy levels, not arbitrary ambition. Track personal stability, not household logistics.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── system-hud.tsx        # Fixed top status bar (monospace branding, time, streak)
│   │   ├── the-deck.tsx          # Floating macOS-style dock for navigation
│   │   ├── vitality-gauge.tsx    # Main energy state selector (hero component)
│   │   ├── the-anchor.tsx        # Daily stabilizing habits with metallic toggles
│   │   ├── the-construct.tsx     # Project tracker with multi-project support & templates
│   │   ├── brain-dump.tsx        # Thought capture with tags, search, and categorization
│   │   ├── momentum-widget.tsx   # Streak tracking and small-win celebration
│   │   ├── energy-history.tsx    # Weekly heatmap and energy pattern insights
│   │   ├── weekly-reflections.tsx # Weekly summaries and data export
│   │   └── ui/
│   │       └── spotlight-card.tsx # Mouse-tracking halo effect card wrapper
│   ├── pages/
│   │   └── dashboard.tsx         # Scroll-based dashboard with section navigation
│   └── App.tsx                   # Application entry with routing
server/
├── routes.ts                     # API endpoints
├── storage.ts                    # PostgreSQL storage with Drizzle ORM
├── db.ts                         # Database connection
shared/
└── schema.ts                     # TypeScript types and Zod schemas
```

## Design System: Organic Steel (Premium Edition)

### P3 Color Space
Uses Display P3 color gamut for richer, deeper colors on OLED displays (with sRGB fallbacks):
- **P3 Steel Dark**: `color(display-p3 0.05 0.05 0.07)`
- **P3 Nebula Cyan**: `color(display-p3 0.2 0.9 1)` - 25% more vibrant on supported displays
- **P3 Nebula Blue**: `color(display-p3 0.2 0.6 1)`
- **P3 Glow Purple**: `color(display-p3 0.6 0.3 1)`

### Film Grain Texture
Subtle 3% opacity fractal noise overlay on body background - prevents color banding and adds premium depth (anodized aluminum feel).

### Glassmorphism
Cards use `backdrop-filter: blur(20px)` with translucent backgrounds for premium glass effect.

### Colors (sRGB Fallbacks)
- **Steel Grays**: Deep charcoal backgrounds (#121212 to #1c1c1c)
- **Nebula Accents**: Cyan (#22d3ee), Blue (#3b82f6), Purple (#8b5cf6)
- **Glow Effects**: Soft box-shadows with nebula colors for active states

### Typography
- **Font Family**: DM Sans, Inter (rounded, easy on tired eyes)
- **Hierarchy**: Large headings for modules, smaller supporting text

### Navigation Architecture (macOS-Inspired)

#### SystemHUD (Top Bar)
- Fixed transparent status bar with backdrop blur
- Left: Green status indicator + "Sanctuary_OS v1.0" monospace branding
- Right: Streak counter, connectivity icons, time display
- Spring animation on mount (y: -48 to 0)

#### TheDeck (Bottom Dock)
- Floating macOS-style dock at bottom center
- 7 navigation icons with physics-based hover scaling (1.15x lift effect)
- Active state indicator (white dot) with layoutId animation
- Icons: Vitality, Anchor, Brain Dump, Construct, History, Momentum, Reflect
- Clicking an icon smooth-scrolls to the corresponding section

### SpotlightCard
All major module cards wrapped in SpotlightCard for premium mouse-tracking halo border effects using Framer Motion's useMotionValue.

### Layout
- **Desktop/Mobile**: Single-column scroll-based layout with sections
- **Navigation**: TheDeck at bottom for section navigation
- **Spacing**: Each section has generous padding and min-height for visual breathing room

## Physics-Based Animations (Framer Motion)

### Vitality Gauge - Breathing Orb
State-based breathing animations that feel organic:
- **Low Energy**: 6-second slow breath, scale 1.05, subdued opacity
- **Medium Energy**: 4-second medium breath, scale 1.02
- **High Energy**: 0.5-second fast pulse, scale 1.1, full intensity

### The Anchor - Spring Physics Toggles
- Toggle switches use spring physics: `stiffness: 500, damping: 30`
- `whileTap: { scale: 0.98 }` for tactile micro-feedback
- Haptic feedback via `navigator.vibrate(10)` on mobile

### Brain Dump - AnimatePresence
- Smooth list item entry/exit with spring physics
- Staggered animation delays for visual flow
- Layout animations for reordering

### Optimistic UI
All state changes update instantly (optimistic), with smooth animations providing visual confirmation.

## Modules

### 1. Vitality Gauge (Hero)
- Visual energy state selector with three levels: Low, Medium, High
- **Breathing orb animation** with state-based timing
- Dynamic radial gradient background
- Smart task suggestions that adapt to current energy
- Identity affirmations that validate current state
- Streak counter for consistency tracking

### 2. The Anchor
- 3 daily stabilizing habits: Hydrate, No Phone in Bed, Read Physics
- **Physics-based toggle switches** with spring animations
- Cyan glow effect when active
- Progress indicator (X/3 complete) with spring animation

### 3. The Construct (Project Tracker)
- **Multi-project support**: Create and switch between multiple projects
- **Project templates**: Save projects as reusable templates, apply templates to new projects
- Micro-steps with effort levels (quick/medium/heavy)
- Visual progress bar with glow effects

### 4. Brain Dump (Enhanced)
- Low-friction thought capture with voice input (Web Speech API)
- **AnimatePresence** for smooth list transitions
- **Tagging system**: Create and assign tags to organize thoughts
- **Category auto-detection**: Ideas, Tasks, Reminders, Notes (with user override)
- **Search functionality**: Filter thoughts by text content
- **Filterable views**: Filter by category and/or tags
- Archive functionality for completed thoughts

### 5. Energy History
- Weekly heatmap showing energy patterns by day/hour
- Pattern insights: Peak energy times, rest recommendations
- Navigation between weeks

### 6. Momentum Widget
- Today's wins counter
- Weekly progress toward goal
- Streak tracking with motivational messages

### 7. Weekly Reflections
- Weekly summary: Anchors completed, Tasks completed, Thoughts captured
- Energy insights based on logged patterns
- Focus areas (top tags used)
- **Data export**: JSON and CSV export of all data

## Data Persistence

Using PostgreSQL database with Drizzle ORM for cross-device sync and historical tracking.

### Database Tables
- `energy_logs` - Historical energy level tracking
- `anchors` / `anchor_completions` - Daily habits and completion tracking
- `projects` / `project_steps` - Project management
- `project_templates` / `template_steps` - Reusable project templates
- `tags` / `brain_dump_entries` - Thought organization with tagging
- `daily_summaries` - Daily reflection data
- `streaks` - Consistency tracking
- `user_settings` - User preferences

## API Endpoints

### Sanctuary
- `GET /api/sanctuary` - Combined dashboard data

### Energy
- `GET /api/energy` - Get current energy state
- `POST /api/energy/log` - Log new energy level
- `GET /api/energy/logs` - Get energy history
- `GET /api/energy/patterns` - Get energy patterns

### Projects & Templates
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/steps` - Get project steps
- `POST /api/project-steps` - Add step to project
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `POST /api/template-steps` - Add step to template

### Brain Dump
- `GET /api/brain-dump` - Get entries (with search/filter params)
- `POST /api/brain-dump` - Add entry with category/tags
- `PATCH /api/brain-dump/:id` - Update entry
- `PATCH /api/brain-dump/:id/archive` - Archive entry
- `DELETE /api/brain-dump/:id` - Delete entry

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create new tag

### Reflections & Export
- `GET /api/reflection` - Get weekly reflection data
- `GET /api/export` - Export all data as JSON

## Running the Application

The application runs on port 5000 with:
- Frontend: Vite dev server
- Backend: Express.js
- Database: PostgreSQL (Neon)

```bash
npm run dev
```

## User Preferences

- Dark mode only (optimized for nighttime use)
- Anti-productivity messaging (never guilt-trip)
- Validating tone throughout the interface
- Physics-based, calm animations
