"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MomentumWidget() {
  const completedToday = 5
  const weeklyCompletion = 28
  const weeklyTarget = 35

  const completionPercentage = Math.round((weeklyCompletion / weeklyTarget) * 100)

  return (
    <Card className="steel-card border-accent/20 h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Momentum</CardTitle>
        <CardDescription className="text-xs">Small wins compounding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Small Wins */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Today's Wins</span>
            <span className="text-sm font-black text-accent">{completedToday}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-full h-2 rounded-full bg-accent/40" />
            ))}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="pt-2 border-t border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Week Progress</span>
            <span className="text-xs font-semibold text-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-steel-light/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Celebration Message */}
        <div className="pt-2 text-xs text-primary/70 italic">
          {completionPercentage >= 80
            ? "You're crushing it."
            : completionPercentage >= 50
              ? "Solid progress."
              : "Build it up."}
        </div>
      </CardContent>
    </Card>
  )
}
