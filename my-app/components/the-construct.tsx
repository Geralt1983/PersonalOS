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

const effortCopy: Record<ProjectStep["effort"], { label: string; tone: string }> = {
  quick: { label: "Quick", tone: "Low bandwidth" },
  medium: { label: "Steady", tone: "Moderate focus" },
  heavy: { label: "Deep", tone: "High intention" },
}

export function TheConstruct() {
  const [steps, setSteps] = useState<ProjectStep[]>([
    {
      id: 1,
      title: "Clear & assess",
      description: "Remove existing items, measure space",
      completed: true,
      effort: "quick",
    },
    {
      id: 2,
      title: "Prime walls",
      description: "Prep and prime for paint",
      completed: true,
      effort: "medium",
    },
    {
      id: 3,
      title: "Paint sunroom",
      description: "Two coats of Coastal Blue",
      completed: false,
      effort: "heavy",
    },
    {
      id: 4,
      title: "Install shelving",
      description: "Mount 3 floating shelves",
      completed: false,
      effort: "medium",
    },
    {
      id: 5,
      title: "Style & decorate",
      description: "Add plants, books, lighting",
      completed: false,
      effort: "quick",
    },
  ])

  const toggleStep = (id: number) => {
    setSteps((prev) => prev.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step)))
  }

  const completedCount = steps.filter((s) => s.completed).length
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <Card className="steel-card relative flex flex-col overflow-hidden border border-primary/20 bg-gradient-to-br from-steel-medium/70 via-steel-dark/85 to-steel-dark shadow-[0_32px_90px_-52px_rgba(56,189,248,0.5)]">
      <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-28 w-28 rounded-full bg-accent/18 blur-3xl" />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground/70">Sunroom project</div>
            <CardTitle className="text-lg font-semibold">The Construct</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/70">Micro-steps keep scale gentle</CardDescription>
          </div>
          <span className="inline-flex shrink-0 flex-col items-end rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-right">
            <span className="text-2xl font-black text-primary">{progress}%</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-primary/70">complete</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col gap-4 pb-5">
        <div className="h-2 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-nebula-cyan transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => {
            const effort = effortCopy[step.effort]
            return (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                type="button"
                aria-pressed={step.completed}
                className={`group relative w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  step.completed
                    ? "border-primary/60 bg-primary/10 shadow-[0_22px_55px_rgba(56,189,248,0.28)]"
                    : "border-white/10 bg-white/[0.04] hover:border-primary/40 hover:bg-white/[0.08]"
                }`}
              >
                <div className="absolute -left-4 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/70 to-transparent md:block" />
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                      step.completed
                        ? "border-primary/80 bg-primary/20 text-primary"
                        : "border-white/15 text-muted-foreground"
                    }`}
                  >
                    {step.completed ? "✓" : index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-medium tracking-tight ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                      >
                        {step.title}
                      </p>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground/70">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/70" /> {effort.label}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground/75">{step.description}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground/60">{effort.tone}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
