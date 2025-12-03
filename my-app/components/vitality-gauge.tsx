"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EnergyLevel = "low" | "medium" | "high"

interface EnergyTask {
  label: string
  duration: string
}

const energyTasks: Record<EnergyLevel, EnergyTask[]> = {
  low: [
    { label: "Meditate / Rest", duration: "10 min" },
    { label: "Nap", duration: "20-30 min" },
    { label: "Hydrate & Eat", duration: "5-10 min" },
    { label: "Listen to Podcast", duration: "20 min" },
  ],
  medium: [
    { label: "Light Cleanup", duration: "15-20 min" },
    { label: "Reply to Messages", duration: "15 min" },
    { label: "Laundry Prep", duration: "10 min" },
    { label: "Meal Prep", duration: "30 min" },
  ],
  high: [
    { label: "Fix Sunroom Shelving", duration: "1-2 hours" },
    { label: "Paint Accent Wall", duration: "2-3 hours" },
    { label: "Deep Project Work", duration: "2+ hours" },
    { label: "Deep Clean", duration: "45 min - 1 hour" },
  ],
}

const energyColors = {
  low: "from-cyan/20 to-blue/20 border-cyan/30",
  medium: "from-blue/20 to-primary/20 border-primary/30",
  high: "from-primary/20 to-accent/20 border-accent/30",
}

const energyGlows = {
  low: "shadow-lg shadow-cyan/20",
  medium: "shadow-lg shadow-primary/20",
  high: "shadow-lg shadow-accent/20",
}

const identityAffirmations: Record<EnergyLevel, string> = {
  low: "You're grounded. You're present. Rest is productive.",
  medium: "You're steady. You're capable. Progress builds momentum.",
  high: "You're unstoppable. You're focused. This is your time.",
}

export function VitalityGauge() {
  const [currentEnergy, setCurrentEnergy] = useState<EnergyLevel>("medium")
  const [consistencyStreak, setConsistencyStreak] = useState(7)

  const handleCycle = () => {
    setCurrentEnergy(currentEnergy === "low" ? "medium" : currentEnergy === "medium" ? "high" : "low")
  }

  return (
    <Card
      className={`steel-card border-2 ${energyColors[currentEnergy]} ${energyGlows[currentEnergy]} h-full flex flex-col`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">Vitality Gauge</CardTitle>
            <CardDescription className="text-base mt-1">Your current energy state</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-accent">{consistencyStreak}</div>
            <div className="text-xs text-muted-foreground font-medium">day streak</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6">
        {/* Energy Circle - Hero Metric */}
        <div className="flex items-center justify-center">
          <div className="relative w-56 h-56">
            <div
              className={`absolute inset-0 rounded-full blur-2xl ${
                currentEnergy === "low" ? "bg-cyan/30" : currentEnergy === "medium" ? "bg-primary/30" : "bg-accent/30"
              }`}
            />
            <button
              onClick={handleCycle}
              className="absolute inset-0 rounded-full border-8 border-steel-light/40 bg-gradient-to-br from-background/80 to-steel-dark/80 flex flex-col items-center justify-center cursor-pointer hover:border-steel-light/60 transition-all duration-300"
            >
              <div className="text-center">
                <div
                  className={`text-6xl font-black capitalize mb-3 ${
                    currentEnergy === "low" ? "text-cyan" : currentEnergy === "medium" ? "text-primary" : "text-accent"
                  }`}
                >
                  {currentEnergy}
                </div>
                <div className="text-xs text-muted-foreground font-medium">Click to cycle</div>
              </div>
            </button>
          </div>
        </div>

        <div className="text-center px-4 py-3 rounded-lg bg-steel-light/20 border border-primary/20">
          <div className="text-sm italic text-primary/80">{identityAffirmations[currentEnergy]}</div>
        </div>

        {/* Task Recommendations */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Suggested Activities
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {energyTasks[currentEnergy].map((task, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-steel-light/20 border border-border/40 hover:bg-steel-light/40 hover:border-border/60 transition-all group"
              >
                <div className="text-primary text-sm mt-0.5 font-bold">→</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {task.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{task.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
