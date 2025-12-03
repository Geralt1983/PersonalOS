"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FamilyMember {
  name: string
  lastEvent: string
  time: string
  color: string
}

export function ThePod() {
  const [familyStatus] = useState<FamilyMember[]>([
    { name: "Newborn", lastEvent: "Fed", time: "2h ago", color: "text-secondary" },
    { name: "Newborn", lastEvent: "Changed", time: "45m ago", color: "text-secondary" },
    { name: "Newborn", lastEvent: "Slept", time: "1h 20m ago", color: "text-secondary" },
    { name: "Lucas", lastEvent: "Breakfast", time: "3h ago", color: "text-primary" },
    { name: "Sofia", lastEvent: "At School", time: "All day", color: "text-accent" },
  ])

  return (
    <Card className="steel-card border-secondary/20 h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">The Pod</CardTitle>
        <CardDescription>Family status glance</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Family Status List */}
        <div className="space-y-2 flex-1">
          {familyStatus.map((member, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-md bg-steel-light/20 border border-border/30"
            >
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${member.color}`}>{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.lastEvent}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">{member.time}</div>
            </div>
          ))}
        </div>

        {/* Next Schedule */}
        <div className="border-t border-border/30 pt-4">
          <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">Next Event</div>
          <div className="p-2.5 rounded-md bg-primary/10 border border-primary/30">
            <div className="text-sm font-medium text-primary">Lucas Soccer Pickup</div>
            <div className="text-xs text-muted-foreground">In 2 hours</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
