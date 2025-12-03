# Sanctuary OS - Design Guidelines

## Design Philosophy
**Core Principle**: Anti-productivity guilt system. Match tasks to energy levels, not arbitrary ambition. Track personal stability and self-care, not household logistics. Messaging adapts to energy state - rest is validated, not punished.

## Visual Aesthetic: "Organic Steel"
Dark, protective steel textures with soft nebula-blue glows. Optimized exclusively for dark mode. Create a sense of industrial strength meets cosmic calm - a fortress for exhausted minds.

## Color System
- **Base Steel Grays**: Deep charcoal backgrounds (#1a1a1a to #2a2a2a), lighter steel for cards (#2d2d2d to #3a3a3a)
- **Nebula Accents**: Cyan-to-blue gradient glows (#00d4ff to #0066ff) for active states, progress, and highlights
- **Subtle Glows**: Use box-shadow with cyan/blue for interactive elements and completion states
- **Text**: Light gray (#e5e5e5) for primary text, softer gray (#a0a0a0) for secondary

## Typography
- **Font Family**: Rounded sans-serif (Inter Rounded, DM Sans, or similar) - optimized for tired eyes
- **Hierarchy**: 
  - Hero/Module Titles: 2xl-3xl, medium weight
  - Body: base-lg, regular weight
  - Supporting Text: sm, lighter weight
- **Tone**: Calm, validating, never pushy. "You're doing fine" not "You should do more"

## Layout Structure

### Hero Section - Vitality Gauge (Left 60%)
- Dominant left column spanning 60% viewport width
- Visual energy state selector with three states:
  - **High Energy**: Bright nebula glow, suggests ambitious tasks
  - **Medium Energy**: Moderate glow, suggests sustainable tasks
  - **Low Energy**: Soft glow, suggests rest/minimal tasks, validates recovery
- Include identity affirmations below energy selector
- Smart task suggestions that change based on selected energy state

### Right Column Stack (40%)
Stack these modules vertically with consistent spacing:

1. **The Anchor** (Daily Habits)
   - 3 habit cards: "Hydrate", "No Phone in Bed", "Read Physics"
   - Metallic toggle switches that glow cyan when active
   - Progress indicator showing completion (e.g., "2/3 complete")
   - Satisfying tactile feel - these are YOUR stabilizing rituals

2. **The Construct** (Sunroom Project)
   - Micro-step breakdown of large home project
   - Visual progress bar with nebula glow
   - Time estimates per step
   - Celebrates small progress

3. **Brain Dump**
   - Low-friction capture area (text input)
   - Simple, non-intimidating interface
   - Offloads mental RAM - capture fleeting thoughts
   - Optional voice input indicator

4. **Momentum Widget**
   - Streak counter with subtle animation
   - Small-win celebration (not guilt-inducing)
   - Identity-based motivation: "Parent who takes care of themselves"

## Component Styling

### Interactive Elements
- **Toggle Switches**: Metallic appearance with cyan glow when active, satisfying slide animation
- **Buttons**: Steel-gray base, nebula glow on hover, rounded corners (lg)
- **Cards**: Dark steel background with subtle border, soft inner shadow for depth
- **Progress Indicators**: Gradient cyan-to-blue fills, smooth transitions

### Spacing & Rhythm
- Use Tailwind units: 4, 6, 8 for consistent spacing
- Module padding: p-6 to p-8
- Inter-module gaps: gap-6
- Generous breathing room - never cramped

## Micro-Interactions
- **Subtle glows**: Hover states get soft cyan halos
- **Smooth transitions**: 200-300ms easing for state changes
- **Satisfying feedback**: Toggle switches, checkmarks feel tangible
- **No aggressive animations**: Calm, measured movements only

## Data Persistence
Local storage for:
- Current energy state
- Habit completion status
- Project progress
- Brain dump entries
- Streak data

## Tone & Messaging
- **High Energy**: "You've got momentum - here are some bigger wins"
- **Medium Energy**: "Steady progress - these feel manageable"
- **Low Energy**: "Rest is productive. Gentle wins only" or "Recovery is valid"
- Never guilt-trip, always validate current state

## Responsive Behavior
- Desktop (default): 60/40 split
- Tablet: Stack to single column, Vitality Gauge first
- Mobile: Full-width cards, preserve module order