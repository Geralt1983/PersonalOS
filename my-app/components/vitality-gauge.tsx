"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EnergyLevel = "low" | "medium" | "high"

interface EnergyTask {
  label: string
  duration: string
}

const energyTasks: Record<EnergyLevel, EnergyTask[]> = {
  low: [
    { label: "Meditate / Rest", duration: "10 min" },
    { label: "Hydrate & Eat", duration: "5-10 min" },
    { label: "Gentle stretch", duration: "6 min" },
    { label: "Listen to podcast", duration: "20 min" },
  ],
  medium: [
    { label: "Light cleanup", duration: "15 min" },
    { label: "Reply to messages", duration: "15 min" },
    { label: "Laundry reset", duration: "12 min" },
    { label: "Meal prep", duration: "30 min" },
  ],
  high: [
    { label: "Fix sunroom shelving", duration: "90 min" },
    { label: "Paint accent wall", duration: "120 min" },
    { label: "Deep project work", duration: "2+ hrs" },
    { label: "Deep clean", duration: "45 min" },
  ],
}

const energyIdentity: Record<EnergyLevel, { heading: string; message: string; glow: string; border: string; halo: string }> = {
  low: {
    heading: "Low Tide",
    message: "Go soft. Rest, hydrate, steady your nervous system.",
    glow: "from-cyan/20 via-cyan/10 to-transparent",
    border: "border-cyan/30",
    halo: "bg-cyan/25",
  },
  medium: {
    heading: "Steady Current",
    message: "You can nudge projects forward with sustainable effort.",
    glow: "from-primary/25 via-primary/15 to-transparent",
    border: "border-primary/30",
    halo: "bg-primary/25",
  },
  high: {
    heading: "Solar Flare",
    message: "Harness the surge. Take a moon-shot and ride momentum.",
    glow: "from-accent/25 via-accent/10 to-transparent",
    border: "border-accent/35",
    halo: "bg-accent/25",
  },
}

export function VitalityGauge() {
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>("medium")
  const [consistencyStreak] = useState(7)

  const tasks = energyTasks[currentEnergy]
  const identity = useMemo(() => energyIdentity[currentEnergy], [currentEnergy])

  return (
    <Card
      className={`steel-card border bg-gradient-to-br ${identity.glow} ${identity.border} shadow-[0_40px_120px_-45px_rgba(56,189,248,0.45)] md:shadow-[0_60px_180px_-80px_rgba(56,189,248,0.45)] overflow-hidden`}
    >
      <CardHeader className="relative pb-6">
        <div className="absolute -right-16 top-1/2 hidden h-32 w-32 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl md:block" />
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight md:text-3xl">Vitality Gauge</CardTitle>
            <CardDescription className="max-w-sm text-sm text-muted-foreground/90 md:text-base">
              Tap a state. We reshape the day to match your nervous system, not the other way around.
            </CardDescription>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur md:flex-col md:items-end md:px-5">
            <div className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground/60">Consistency</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-accent md:text-4xl">{consistencyStreak}</span>
              <span className="text-xs font-medium text-muted-foreground">day streak</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-8">
        {/* Energy selector */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(
            [
              { key: "low", label: "Low", tone: "Soft Reset" },
              { key: "medium", label: "Medium", tone: "Steady Build" },
              { key: "high", label: "High", tone: "Full Send" },
            ] satisfies { key: EnergyLevel; label: string; tone: string }[]
          ).map((option) => {
            const active = option.key === currentEnergy
            return (
              <button
                key={option.key}
                onClick={() => setCurrentEnergy(option.key)}
                className={`group relative overflow-hidden rounded-xl border px-3 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-4 sm:py-4 ${
                  active
                    ? "border-primary/60 bg-white/8 shadow-[0_18px_48px_rgba(56,189,248,0.35)]"
                    : "border-white/10 bg-white/2 hover:border-primary/30 hover:bg-white/6"
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-50 ${
                    active ? "opacity-60" : ""
                  }`}
                  style={{
                    background:
                      option.key === "low"
                        ? "radial-gradient(circle at top, rgba(34,211,238,0.4), transparent 65%)"
                        : option.key === "medium"
                          ? "radial-gradient(circle at top, rgba(59,130,246,0.45), transparent 65%)"
                          : "radial-gradient(circle at top, rgba(168,85,247,0.4), transparent 65%)",
                  }}
                />
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground/70">
                    <span>{option.label}</span>
                    <span className={`text-[0.6rem] font-semibold ${active ? "text-primary/80" : "opacity-60"}`}>
                      {option.tone}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 text-lg font-semibold sm:text-xl">
                    {option.key === "low" ? "⚖️" : option.key === "medium" ? "🌙" : "⚡"}
                    <span className={`${active ? "text-primary" : "text-foreground/80"}`}>{option.label} Energy</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Hero energy core */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-12">
          <div className="relative flex w-full items-center justify-center md:w-auto">
            <div className={`absolute inset-4 rounded-full blur-3xl ${identity.halo}`} />
            <div className="relative flex items-center justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-background/80 to-steel-medium/80 shadow-[0_30px_80px_rgba(15,23,42,0.55)] sm:h-52 sm:w-52 lg:h-56 lg:w-56">
                <div className="absolute inset-0 animate-pulse rounded-full border border-white/4" />
                <div className="text-center">
                  <div className="text-sm uppercase tracking-[0.4em] text-muted-foreground/50">Current</div>
                  <div className="mt-2 text-4xl font-bold capitalize text-white sm:text-5xl">{currentEnergy}</div>
                  <div className="mt-2 text-xs text-muted-foreground">Tap tabs to recalibrate</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary/90 shadow-[0_22px_55px_rgba(56,189,248,0.22)] sm:px-6 sm:py-5 sm:text-base">
              <div className="text-xs uppercase tracking-[0.3em] text-primary/70">{identity.heading}</div>
              <p className="mt-1 font-medium text-primary/90">{identity.message}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] uppercase tracking-[0.4em] text-muted-foreground/60">Suggested Wins</span>
                <span className="text-xs text-muted-foreground/80">Swipe on mobile</span>
              </div>
              <div className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-2">
                {tasks.map((task, idx) => (
                  <div
                    key={`${task.label}-${idx}`}
                    className="group relative min-w-[12rem] snap-start rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-300 hover:border-primary/40 hover:bg-white/[0.07] sm:min-w-0"
                  >
                    <div className="absolute -right-10 top-0 h-20 w-20 rounded-full bg-white/5 blur-2xl transition-opacity duration-300 group-hover:opacity-70" />
                    <div className="relative z-10 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-muted-foreground/70">
                        <span>Action</span>
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-primary/80">
                          {task.duration}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground sm:text-base">{task.label}</div>
                      <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground/70">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary/80">
                          {idx === 0 ? "🫧" : idx === 1 ? "✨" : idx === 2 ? "🛠️" : "🚀"}
                        </span>
                        <span className="leading-snug">Fits your {currentEnergy} bandwidth</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
