import { useMemo } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { TrendingUp, Flame, Star } from "lucide-react";
import type { MomentumData } from "@shared/schema";

interface MomentumWidgetProps {
  data: MomentumData;
}

export function MomentumWidget({ data }: MomentumWidgetProps) {
  const { completedToday, weeklyCompletion, weeklyTarget, streak } = data;
  
  const completionPercentage = useMemo(
    () => Math.round((weeklyCompletion / weeklyTarget) * 100),
    [weeklyCompletion, weeklyTarget]
  );
  
  const message = useMemo(() => {
    if (completionPercentage >= 80) return "You're crushing it.";
    if (completionPercentage >= 60) return "Strong momentum building.";
    if (completionPercentage >= 40) return "Solid progress. Keep going.";
    return "Every step counts. Build it up.";
  }, [completionPercentage]);

  const streakMessage = useMemo(() => {
    if (streak >= 14) return "Two weeks strong. Unstoppable.";
    if (streak >= 7) return "A full week. You're consistent.";
    if (streak >= 3) return "Building momentum.";
    return "Start the streak.";
  }, [streak]);

  const todayWinsArray = useMemo(
    () => Array.from({ length: Math.min(completedToday, 10) }),
    [completedToday]
  );

  const emptyWinsArray = useMemo(
    () => Array.from({ length: Math.max(0, 10 - completedToday) }),
    [completedToday]
  );

  return (
    <SpotlightCard className="steel-card border-nebula-cyan/20 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-nebula-cyan" />
          <CardTitle className="text-sm">Momentum</CardTitle>
        </div>
        <CardDescription className="text-xs">Small wins compounding</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg steel-surface border border-nebula-cyan/20">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-nebula-cyan" data-testid="text-streak-days">{streak}</div>
            <div className="text-xs text-muted-foreground">days</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Today's Wins</span>
            <span className="text-lg font-bold text-glow-purple" data-testid="text-todays-wins">{completedToday}</span>
          </div>
          <div className="flex gap-1">
            {todayWinsArray.map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-2 rounded-full bg-glow-purple/60"
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  animation: "fadeIn 0.3s ease-out forwards"
                }}
              />
            ))}
            {emptyWinsArray.map((_, i) => (
              <div key={`empty-${i}`} className="flex-1 h-2 rounded-full bg-steel-light/30" />
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Week Progress</span>
            <span className="text-sm font-semibold text-nebula-blue" data-testid="text-week-percentage">{completionPercentage}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-steel-light/30 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-nebula-blue to-nebula-cyan transition-all duration-700 progress-glow"
              style={{ width: `${Math.min(completionPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{weeklyCompletion} completed</span>
            <span>Goal: {weeklyTarget}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border/30 space-y-2">
          <div className="flex items-center gap-2 text-xs text-nebula-cyan/80 italic">
            <Star className="w-3 h-3" />
            {message}
          </div>
          <div className="text-xs text-muted-foreground italic">
            {streakMessage}
          </div>
        </div>
      </CardContent>
    </SpotlightCard>
  );
}
