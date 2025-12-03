"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectStep {
  id: number
  title: string
  description: string
  completed: boolean
  effort: "quick" | "medium" | "heavy"
}

export function TheConstruct() {
  const [steps, setSteps] = useState<ProjectStep[]>([
    {
      id: 1,
      title: "Clear & Assess",
      description: "Remove existing items, measure space",
      completed: true,
      effort: "quick",
    },
    {
      id: 2,
      title: "Prime Walls",
      description: "Prep and prime for paint",
      completed: true,
      effort: "medium",
    },
    {
      id: 3,
      title: "Paint Sunroom",
      description: "Two coats of Coastal Blue",
      completed: false,
      effort: "heavy",
    },
    {
      id: 4,
      title: "Install Shelving",
      description: "Mount 3 floating shelves",
      completed: false,
      effort: "medium",
    },
    {
      id: 5,
      title: "Style & Decorate",
      description: "Add plants, books, lighting",
      completed: false,
      effort: "quick",
    },
  ])

  const toggleStep = (id: number) => {
    setSteps(steps.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step)))
  }

  const completedCount = steps.filter((s) => s.completed).length
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <Card className="steel-card border-accent/20 h-fit flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Sunroom Project</CardTitle>
        <CardDescription className="text-xs">{progress}% complete</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-1.5 rounded-full bg-steel-light/50 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps - Compact Version */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {steps.map((step) => (
            <div key={step.id} onClick={() => toggleStep(step.id)} className="cursor-pointer group">
              <div className="flex items-start gap-2 p-2 rounded-md hover:bg-steel-light/40 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-3.5 h-3.5 rounded border-1.5 flex items-center justify-center transition-all ${
                      step.completed ? "bg-accent border-accent" : "border-border/60 group-hover:border-accent"
                    }`}
                  >
                    {step.completed && <span className="text-xs text-background font-bold">✓</span>}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-medium transition-opacity ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
