"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MomentumWidget() {
  const completedToday = 5
  const weeklyCompletion = 28
  const weeklyTarget = 35

  const completionPercentage = Math.round((weeklyCompletion / weeklyTarget) * 100)
  const remaining = Math.max(weeklyTarget - weeklyCompletion, 0)

  return (
    <Card className="steel-card relative overflow-hidden border border-accent/25 bg-gradient-to-br from-steel-medium/70 via-steel-dark/85 to-steel-dark shadow-[0_32px_90px_-48px_rgba(168,85,247,0.55)]">
      <div className="pointer-events-none absolute -right-20 top-14 h-32 w-32 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground/70">Momentum</CardTitle>
        <CardDescription className="text-xs text-muted-foreground/80">Tiny wins compounding into balance</CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 space-y-5">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground/70">Today</span>
            <span className="text-3xl font-black text-accent">{completedToday}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground/70">Micro wins logged before midnight.</p>
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < completedToday ? "bg-gradient-to-r from-accent to-primary" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
            <span>Week Trajectory</span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[0.6rem] font-semibold text-accent/80">
              {completionPercentage}% tuned
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{weeklyCompletion} wins logged</p>
              <p className="text-xs text-muted-foreground/70">{remaining} to go for this week&apos;s promise.</p>
            </div>
            <div className="grid aspect-square h-16 place-content-center rounded-full border border-accent/40 bg-accent/15 text-sm font-semibold text-accent/90">
              <span>{weeklyTarget}</span>
              <span className="text-[0.6rem] uppercase tracking-[0.25em] text-accent/70">Target</span>
            </div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-nebula-cyan transition-all"
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            />
          </div>
        </section>

        <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-primary/80">
          <span className="uppercase tracking-[0.35em]">Note</span>
          <p className="max-w-[11rem] text-right text-[0.7rem] leading-relaxed text-muted-foreground">
            Celebrate pattern, not pace. A gentle streak is better than a reckless sprint.
          </p>
        </section>
      </CardContent>
    </Card>
  )
}
