"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EnergyHistory() {
  const energyData = [
    { day: "Mon", low: 40, med: 30, high: 20 },
    { day: "Tue", low: 35, med: 35, high: 25 },
    { day: "Wed", low: 45, med: 28, high: 18 },
    { day: "Thu", low: 38, med: 32, high: 28 },
    { day: "Fri", low: 30, med: 35, high: 35 },
    { day: "Sat", low: 28, med: 38, high: 30 },
    { day: "Sun", low: 32, med: 40, high: 25 },
  ]

  return (
    <Card className="steel-card relative overflow-hidden border border-primary/25 bg-gradient-to-br from-steel-medium/70 via-steel-dark/85 to-steel-dark shadow-[0_32px_90px_-52px_rgba(59,130,246,0.55)]">
      <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 left-10 h-24 w-24 rounded-full bg-nebula-cyan/20 blur-2xl" />

      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Energy pattern</CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80">Seven-day nervous system telemetry</CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-5">
        <div className="space-y-3">
          {energyData.map((day) => (
            <div key={day.day} className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
                <span>{day.day}</span>
                <span className="text-[0.6rem] font-semibold text-primary/80">
                  {day.high >= 30 ? "Spiked" : day.med >= 35 ? "Steady" : "Soft"}
                </span>
              </div>
              <div className="flex h-6 gap-1 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div
                  className="h-full bg-cyan/70 transition-all hover:bg-cyan/80"
                  style={{ width: `${day.low}%` }}
                  title={`Low: ${day.low}%`}
                />
                <div
                  className="h-full bg-primary/70 transition-all hover:bg-primary/80"
                  style={{ width: `${day.med}%` }}
                  title={`Medium: ${day.med}%`}
                />
                <div
                  className="h-full bg-accent/70 transition-all hover:bg-accent/80"
                  style={{ width: `${day.high}%` }}
                  title={`High: ${day.high}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[0.65rem] tracking-[0.2em] text-muted-foreground/60">
                <span>Low {day.low}%</span>
                <span>Med {day.med}%</span>
                <span>High {day.high}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-muted-foreground/70">
          <div className="flex flex-wrap items-center justify-between gap-2 uppercase tracking-[0.3em]">
            <span className="inline-flex items-center gap-2 text-cyan/80">
              <span className="h-2 w-2 rounded-full bg-cyan/70" /> Recuperate
            </span>
            <span className="inline-flex items-center gap-2 text-primary/80">
              <span className="h-2 w-2 rounded-full bg-primary/70" /> Sustain
            </span>
            <span className="inline-flex items-center gap-2 text-accent/80">
              <span className="h-2 w-2 rounded-full bg-accent/70" /> Surge
            </span>
          </div>
          <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
            Notice how Friday&apos;s high surge precedes a cooler weekend. Protect recovery windows — capacity grows from
            softness first.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
