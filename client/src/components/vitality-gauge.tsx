import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Moon, Sun, ArrowRight } from "lucide-react";
import type { EnergyLevel, EnergyTask } from "@shared/schema";

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
};

const energyConfig = {
  low: {
    color: "text-nebula-cyan",
    bgGlow: "bg-nebula-cyan/30",
    borderGlow: "border-nebula-cyan/40",
    shadowGlow: "shadow-[0_0_30px_rgba(34,211,238,0.25)]",
    icon: Moon,
    label: "Low",
    message: "Rest is productive.",
  },
  medium: {
    color: "text-nebula-blue",
    bgGlow: "bg-nebula-blue/30",
    borderGlow: "border-nebula-blue/40",
    shadowGlow: "shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    icon: Sun,
    label: "Medium",
    message: "Steady progress.",
  },
  high: {
    color: "text-glow-purple",
    bgGlow: "bg-glow-purple/30",
    borderGlow: "border-glow-purple/40",
    shadowGlow: "shadow-[0_0_30px_rgba(139,92,246,0.25)]",
    icon: Zap,
    label: "High",
    message: "You're unstoppable.",
  },
};

const identityAffirmations: Record<EnergyLevel, string> = {
  low: "You're grounded. You're present. Rest is productive.",
  medium: "You're steady. You're capable. Progress builds momentum.",
  high: "You're unstoppable. You're focused. This is your time.",
};

interface VitalityGaugeProps {
  energyLevel: EnergyLevel;
  streak: number;
  onEnergyChange: (level: EnergyLevel) => void;
}

export function VitalityGauge({ energyLevel, streak, onEnergyChange }: VitalityGaugeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = energyConfig[energyLevel];
  const Icon = config.icon;

  const handleCycle = () => {
    setIsAnimating(true);
    const nextLevel: EnergyLevel = energyLevel === "low" ? "medium" : energyLevel === "medium" ? "high" : "low";
    onEnergyChange(nextLevel);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Card className={`steel-card border-2 ${config.borderGlow} ${config.shadowGlow} h-full flex flex-col transition-all duration-500`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight" data-testid="text-vitality-title">Vitality Gauge</CardTitle>
            <CardDescription className="text-base mt-1">Your current energy state</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${config.color}`} data-testid="text-streak-count">{streak}</div>
            <div className="text-xs text-muted-foreground font-medium">day streak</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-center py-4">
          <div className="relative w-56 h-56">
            <div className={`absolute inset-0 rounded-full blur-2xl ${config.bgGlow} energy-pulse`} />
            
            <button
              onClick={handleCycle}
              data-testid="button-energy-cycle"
              className={`
                absolute inset-0 rounded-full 
                border-[6px] border-steel-light/40 
                bg-gradient-to-br from-steel-medium/80 to-steel-dark/90 
                flex flex-col items-center justify-center 
                cursor-pointer transition-all duration-300
                hover:border-steel-light/60 hover:scale-[1.02]
                active:scale-[0.98]
                ${isAnimating ? "scale-95" : ""}
              `}
            >
              <div className={`mb-2 ${config.color} transition-transform duration-300 ${isAnimating ? "scale-125" : ""}`}>
                <Icon className="w-12 h-12" strokeWidth={1.5} />
              </div>
              <div className={`text-5xl font-black capitalize ${config.color} transition-all duration-300`}>
                {config.label}
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-2">Click to cycle</div>
            </button>
          </div>
        </div>

        <div className={`text-center px-4 py-3 rounded-lg steel-surface border ${config.borderGlow} transition-all duration-500`}>
          <div className={`text-sm italic ${config.color}/80`} data-testid="text-affirmation">
            {identityAffirmations[energyLevel]}
          </div>
        </div>

        <div className="space-y-3 flex-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Suggested Activities
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {energyTasks[energyLevel].map((task, idx) => (
              <div
                key={idx}
                data-testid={`card-task-${idx}`}
                className="flex items-center gap-3 p-3 rounded-lg steel-surface border border-border/40 hover:border-border/60 transition-all group cursor-pointer"
              >
                <ArrowRight className={`w-4 h-4 ${config.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium text-foreground group-hover:${config.color} transition-colors`}>
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
  );
}
