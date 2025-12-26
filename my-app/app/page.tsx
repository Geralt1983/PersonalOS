"use client"

import { VitalityGauge } from "@/components/vitality-gauge"
import { TheConstruct } from "@/components/the-construct"
import { BrainDump } from "@/components/brain-dump"
import { EnergyHistory } from "@/components/energy-history"
import { MomentumWidget } from "@/components/momentum-widget"
import { TheAnchor } from "@/components/the-anchor"

export default function SanctuaryOS() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-steel-dark to-background">
      <div className="pointer-events-none absolute -top-64 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 opacity-80 blur-3xl md:opacity-50" />
      <div className="pointer-events-none absolute right-[-12rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-nebula-cyan/20 blur-[140px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-12 sm:px-6 lg:px-10">
        <header className="space-y-5 text-center lg:text-left">
          <div className="section-chip inline-flex items-center justify-center gap-2 self-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary/80 lg:self-start">
            sanctuary status
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-balance sm:text-5xl md:text-6xl">Sanctuary OS</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground lg:mx-0 lg:text-lg">
            Tune into your current energy, stabilise the non-negotiables, and let the rest flow. Your dashboard adapts to
            mobile so recalibration is always one thumb away.
          </p>
          <div className="grid gap-3 text-xs text-muted-foreground/80 sm:grid-cols-2 sm:text-sm">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-left shadow-[0_20px_45px_rgba(56,189,248,0.18)]">
              <span className="font-semibold text-primary/90">Energy-matched focus</span>
              <span className="mt-1 block opacity-80">Tap a state to surface the right scale of wins.</span>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-left shadow-[0_20px_45px_rgba(168,85,247,0.18)]">
              <span className="font-semibold text-accent/90">Mobile-first calm</span>
              <span className="mt-1 block opacity-80">Cards stack with breathing space, glows stay grounded.</span>
            </div>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,_1.7fr)_minmax(0,_1fr)] lg:items-start">
          <section className="space-y-6 lg:space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="section-chip text-muted-foreground/70">Vitality Field</span>
              <span className="text-xs text-muted-foreground">Swipe tasks or tap states for instant recalibration</span>
            </div>
            <VitalityGauge />
          </section>

          <section className="flex flex-col gap-8">
            <div className="space-y-3">
              <span className="section-chip text-muted-foreground/70">Stability Rituals</span>
              <TheAnchor />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <MomentumWidget />
              <EnergyHistory />
            </div>

            <div className="space-y-3">
              <span className="section-chip text-muted-foreground/70">Project Pulse</span>
              <TheConstruct />
            </div>

            <div className="space-y-3">
              <span className="section-chip text-muted-foreground/70">Release Valve</span>
              <BrainDump />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
