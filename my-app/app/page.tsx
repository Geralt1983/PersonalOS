"use client"

import { VitalityGauge } from "@/components/vitality-gauge"
import { TheConstruct } from "@/components/the-construct"
import { BrainDump } from "@/components/brain-dump"
import { EnergyHistory } from "@/components/energy-history"
import { MomentumWidget } from "@/components/momentum-widget"
import { TheAnchor } from "@/components/the-anchor"

export default function SanctuaryOS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-steel-dark to-background p-6 md:p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-2 text-balance">Sanctuary OS</h1>
        <p className="text-lg text-muted-foreground">Energy-matched task system for Jeremy</p>
      </div>

      {/* Main Layout: Hero + Supporting Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Left Column: Vitality Gauge (Hero) */}
        <div className="lg:col-span-2">
          <VitalityGauge />
        </div>

        {/* Right Column: Supporting Tools */}
        <div className="flex flex-col gap-8">
          <TheAnchor />
          <MomentumWidget />
          <EnergyHistory />
          <TheConstruct />
          <BrainDump />
        </div>
      </div>
    </div>
  )
}
