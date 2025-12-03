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
    { id: 2, label: "No Phone in Bed", active: false },
    { id: 3, label: "Read Physics (10m)", active: false },
  ])

  const toggleAnchor = (id: number) => {
    setAnchors(anchors.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
  }

  const activeCount = anchors.filter((a) => a.active).length

  return (
    <Card className="steel-card border-none bg-gradient-to-b from-steel-medium to-steel-dark shadow-2xl overflow-hidden relative">
      <div
        className="absolute inset-0 bg-repeat opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <span className="text-nebula-cyan">⚓</span> The Anchor
          </CardTitle>
          <span className="text-xs font-semibold text-nebula-cyan px-2 py-1 rounded-full bg-nebula-cyan/10 border border-nebula-cyan/30">
            {activeCount}/{anchors.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 relative z-10">
        {anchors.map((anchor) => (
          <div key={anchor.id} onClick={() => toggleAnchor(anchor.id)} className="group cursor-pointer relative">
            {/* The Switch Container */}
            <div
              className={`
                relative h-12 rounded-lg border flex items-center px-4 transition-all duration-300
                ${
                  anchor.active
                    ? "bg-nebula-blue/10 border-nebula-blue/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    : "bg-black/40 border-white/5 hover:border-white/10"
                }
              `}
            >
              {/* The Glow Bar */}
              <div
                className={`
                  absolute left-0 top-0 bottom-0 w-1 transition-all duration-300
                  ${anchor.active ? "bg-nebula-cyan shadow-[0_0_10px_#22d3ee]" : "bg-transparent"}
                `}
              />

              {/* Text */}
              <span
                className={`flex-1 font-medium transition-colors ${anchor.active ? "text-foreground" : "text-muted-foreground"}`}
              >
                {anchor.label}
              </span>

              {/* Status Indicator */}
              <div
                className={`
                  w-3 h-3 rounded-full transition-all duration-500
                  ${anchor.active ? "bg-nebula-cyan shadow-[0_0_10px_#22d3ee]" : "bg-steel-light"}
                `}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
