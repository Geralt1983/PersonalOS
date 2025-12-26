"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Anchor {
  id: number
  label: string
  active: boolean
}

export function TheAnchor() {
  const [anchors, setAnchors] = useState<Anchor[]>([
    { id: 1, label: "Hydrate (32oz)", active: true },
    { id: 2, label: "No phone in bed", active: false },
    { id: 3, label: "Read physics (10m)", active: false },
  ])

  const toggleAnchor = (id: number) => {
    setAnchors((prev) => prev.map((anchor) => (anchor.id === id ? { ...anchor, active: !anchor.active } : anchor)))
  }

  const activeCount = anchors.filter((a) => a.active).length

  return (
    <Card className="steel-card relative overflow-hidden border border-nebula-cyan/30 bg-gradient-to-br from-steel-medium/80 via-steel-dark to-steel-dark shadow-[0_28px_70px_-40px_rgba(34,211,238,0.55)]">
      <div className="pointer-events-none absolute -right-20 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-nebula-cyan/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 top-0 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground/70">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-nebula-cyan" />
              Anchor Rituals
            </div>
            <CardTitle className="text-lg font-semibold">Daily stabilisers</CardTitle>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-nebula-cyan/40 bg-nebula-cyan/10 px-3 py-1 text-xs font-semibold text-nebula-cyan/90">
            {activeCount}/{anchors.length} locked
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-3 pb-5">
        {anchors.map((anchor) => {
          const active = anchor.active
          return (
            <button
              key={anchor.id}
              onClick={() => toggleAnchor(anchor.id)}
              type="button"
              aria-pressed={active}
              className={`group relative flex items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-cyan/60 ${
                active
                  ? "border-nebula-cyan/70 bg-nebula-cyan/10 shadow-[0_18px_45px_rgba(34,211,238,0.3)]"
                  : "border-white/10 bg-white/[0.05] hover:border-nebula-cyan/40 hover:bg-white/[0.08]"
              }`}
            >
              <div className="absolute inset-y-0 left-0 w-px scale-y-105 rounded-full bg-gradient-to-b from-transparent via-nebula-cyan/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-3 text-left">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-all ${
                    active ? "border-nebula-cyan/80 bg-nebula-cyan/20 text-nebula-cyan" : "border-white/15 text-muted-foreground"
                  }`}
                >
                  {active ? "✓" : "○"}
                </span>
                <div>
                  <p className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground/85"}`}>{anchor.label}</p>
                  <p className="text-xs text-muted-foreground/70">Tap to {active ? "release" : "activate"} this ritual</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.25em] transition-colors ${
                  active ? "border-white/10 bg-white/10 text-white/90" : "border-white/10 text-white/60"
                }`}
              >
                {active ? "holding" : "available"}
              </span>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
