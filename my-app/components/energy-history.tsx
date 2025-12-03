"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EnergyHistory() {
  // Simulated energy data for the last 7 days
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
    <Card className="steel-card border-secondary/20 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Energy Pattern</CardTitle>
        <CardDescription className="text-xs">Last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {energyData.map((day) => (
            <div key={day.day} className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">{day.day}</div>
              <div className="flex gap-1 h-6 rounded-sm overflow-hidden bg-steel-light/20">
                <div
                  className="bg-cyan/60 hover:bg-cyan/80 transition-colors"
                  style={{ width: `${day.low}%` }}
                  title={`Low: ${day.low}%`}
                />
                <div
                  className="bg-primary/60 hover:bg-primary/80 transition-colors"
                  style={{ width: `${day.med}%` }}
                  title={`Medium: ${day.med}%`}
                />
                <div
                  className="bg-accent/60 hover:bg-accent/80 transition-colors"
                  style={{ width: `${day.high}%` }}
                  title={`High: ${day.high}%`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 pt-2 text-xs border-t border-border/30">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan/60" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary/60" />
            <span className="text-muted-foreground">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent/60" />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
