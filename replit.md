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
│   │   ├── the-construct.tsx     # Sunroom project tracker with micro-steps
│   │   ├── brain-dump.tsx        # Thought capture with optional voice input
│   │   └── momentum-widget.tsx   # Streak tracking and small-win celebration
│   │   └── ui/                   # Shadcn components
│   ├── pages/
│   │   └── dashboard.tsx         # Main dashboard with all modules
│   └── App.tsx                   # Application entry with routing
server/
├── routes.ts                     # API endpoints
├── storage.ts                    # In-memory storage (MemStorage)
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

### 3. The Construct
- Sunroom renovation project tracker
- Micro-steps with effort levels (quick/medium/heavy)
- Visual progress bar with glow effects

### 4. Brain Dump
- Low-friction thought capture
- Optional voice input (Web Speech API)
- Timestamps for each entry

### 5. Momentum Widget
- Today's wins counter
- Weekly progress toward goal
- Streak tracking with motivational messages

## Data Persistence

Currently using localStorage for client-side persistence. The backend provides API endpoints for future server-side storage.

### LocalStorage Key: `sanctuary-os-data`

## API Endpoints

- `GET /api/sanctuary` - Get all sanctuary data
- `GET /api/energy` - Get current energy state
- `PATCH /api/energy` - Update energy level
- `GET /api/anchors` - Get all anchors
- `PATCH /api/anchors/:id/toggle` - Toggle anchor status
- `GET /api/project-steps` - Get all project steps
- `PATCH /api/project-steps/:id/toggle` - Toggle step completion
- `GET /api/brain-dump` - Get all brain dump entries
- `POST /api/brain-dump` - Add new entry
- `DELETE /api/brain-dump/:id` - Delete entry
- `GET /api/momentum` - Get momentum data

## Running the Application

The application runs on port 5000 with:
- Frontend: Vite dev server
- Backend: Express.js

```bash
npm run dev
```

## User Preferences

- Dark mode only (optimized for nighttime use)
- Anti-productivity messaging (never guilt-trip)
- Validating tone throughout the interface
- Calm, measured animations
