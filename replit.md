# Sanctuary OS

A personal energy management dashboard designed for exhausted parents (specifically Jeremy). Built with the "Organic Steel" aesthetic - dark, protective steel textures with soft nebula-blue glows, optimized exclusively for dark mode.

## Core Philosophy

**Anti-productivity guilt.** Match tasks to energy levels, not arbitrary ambition. Track personal stability, not household logistics.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── vitality-gauge.tsx    # Main energy state selector (hero component)
│   │   ├── the-anchor.tsx        # Daily stabilizing habits with metallic toggles
│   │   ├── the-construct.tsx     # Project tracker with multi-project support & templates
│   │   ├── brain-dump.tsx        # Thought capture with tags, search, and categorization
│   │   ├── momentum-widget.tsx   # Streak tracking and small-win celebration
│   │   ├── energy-history.tsx    # Weekly heatmap and energy pattern insights
│   │   ├── weekly-reflections.tsx # Weekly summaries and data export
│   │   └── ui/                   # Shadcn components
│   ├── pages/
│   │   └── dashboard.tsx         # Main dashboard with all modules
│   └── App.tsx                   # Application entry with routing
server/
├── routes.ts                     # API endpoints
├── storage.ts                    # PostgreSQL storage with Drizzle ORM
├── db.ts                         # Database connection
shared/
└── schema.ts                     # TypeScript types and Zod schemas
```

## Design System: Organic Steel

### Colors
- **Steel Grays**: Deep charcoal backgrounds (#121212 to #1c1c1c)
- **Nebula Accents**: Cyan (#22d3ee), Blue (#3b82f6), Purple (#8b5cf6)
- **Glow Effects**: Soft box-shadows with nebula colors for active states

### Typography
- **Font Family**: DM Sans, Inter (rounded, easy on tired eyes)
- **Hierarchy**: Large headings for modules, smaller supporting text

### Layout
- **Desktop**: 60/40 split (Vitality Gauge left, stacked modules right)
- **Tablet/Mobile**: Single column, stacked layout

## Modules

### 1. Vitality Gauge (Hero)
- Visual energy state selector with three levels: Low, Medium, High
- Smart task suggestions that adapt to current energy
- Identity affirmations that validate current state
- Streak counter for consistency tracking

### 2. The Anchor
- 3 daily stabilizing habits: Hydrate, No Phone in Bed, Read Physics
- Metallic toggle switches with cyan glow when active
- Progress indicator (X/3 complete)

### 3. The Construct (Project Tracker)
- **Multi-project support**: Create and switch between multiple projects
- **Project templates**: Save projects as reusable templates, apply templates to new projects
- Micro-steps with effort levels (quick/medium/heavy)
- Visual progress bar with glow effects

### 4. Brain Dump (Enhanced)
- Low-friction thought capture with voice input (Web Speech API)
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
- Calm, measured animations
