import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { EnergyLevel, EnergyLog, EnergyPattern } from "@shared/schema";

interface EnergyLogData {
  id: number;
  level: EnergyLevel;
  loggedAt: string;
  note: string | null;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface HeatmapCell {
  levels: { low: number; medium: number; high: number };
  total: number;
  dominantLevel: EnergyLevel;
}

const levelColors: Record<EnergyLevel, { bg: string; glow: string; text: string; rgb: string }> = {
  low: { 
    bg: "bg-orange-500/20", 
    glow: "shadow-[0_0_8px_rgba(249,115,22,0.4)]", 
    text: "text-orange-400",
    rgb: "249, 115, 22",
  },
  medium: { 
    bg: "bg-nebula-blue/20", 
    glow: "shadow-[0_0_8px_rgba(59,130,246,0.4)]", 
    text: "text-nebula-blue",
    rgb: "59, 130, 246",
  },
  high: { 
    bg: "bg-green-500/20", 
    glow: "shadow-[0_0_8px_rgba(34,197,94,0.4)]", 
    text: "text-green-400",
    rgb: "34, 197, 94",
  },
};

const levelLabels: Record<EnergyLevel, string> = {
  low: "Low Energy",
  medium: "Balanced",
  high: "High Energy",
};

function formatHour(hour: number): string {
  if (hour === 0) return "12a";
  if (hour === 12) return "12p";
  if (hour < 12) return `${hour}a`;
  return `${hour - 12}p`;
}

function getWeekDates(offset: number = 0): { start: Date; end: Date; label: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - dayOfWeek + (offset * 7));
  startOfThisWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfThisWeek);
  endOfWeek.setDate(startOfThisWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const label = offset === 0 
    ? "This Week" 
    : offset === -1 
      ? "Last Week" 
      : `${startOfThisWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  
  return { start: startOfThisWeek, end: endOfWeek, label };
}

export function EnergyHistory() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { start, end, label } = getWeekDates(weekOffset);
  
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];
  
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery<EnergyLogData[]>({
    queryKey: ["/api/energy/logs", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/energy/logs?startDate=${startDate}&endDate=${endDate}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return res.json();
    },
  });

  const { data: patterns, isLoading: patternsLoading } = useQuery<EnergyPattern[]>({
    queryKey: ["/api/energy/patterns"],
    queryFn: async () => {
      const res = await fetch("/api/energy/patterns?days=30", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch patterns");
      return res.json();
    },
  });

  const isLoading = logsLoading || patternsLoading;

  // Build heatmap data from logs - aggregate all logs per day/hour
  const heatmapData: Map<string, HeatmapCell> = new Map();
  let maxCount = 1;
  
  if (logs) {
    for (const log of logs) {
      const date = new Date(log.loggedAt);
      const key = `${date.getDay()}-${date.getHours()}`;
      
      let cell = heatmapData.get(key);
      if (!cell) {
        cell = { 
          levels: { low: 0, medium: 0, high: 0 }, 
          total: 0, 
          dominantLevel: log.level 
        };
        heatmapData.set(key, cell);
      }
      
      cell.levels[log.level]++;
      cell.total++;
      
      // Recalculate dominant level
      const counts = cell.levels;
      if (counts.high >= counts.medium && counts.high >= counts.low) {
        cell.dominantLevel = "high";
      } else if (counts.medium >= counts.low) {
        cell.dominantLevel = "medium";
      } else {
        cell.dominantLevel = "low";
      }
      
      maxCount = Math.max(maxCount, cell.total);
    }
  }

  // Also use patterns data to highlight best times if available
  const patternHints: Map<string, EnergyLevel> = new Map();
  if (patterns) {
    for (const p of patterns) {
      const key = `${p.dayOfWeek}-${p.hour}`;
      patternHints.set(key, p.dominantLevel);
    }
  }

  // Calculate insights from patterns
  const insights = patterns ? calculateInsights(patterns) : null;

  // Recent logs for timeline
  const recentLogs = logs?.slice(0, 10) || [];

  if (isLoading) {
    return (
      <Card className="border-steel-700/50 bg-gradient-to-br from-steel-900 to-steel-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-nebula-cyan" />
            <CardTitle className="text-lg font-semibold text-foreground">Energy History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-steel-700/50 bg-gradient-to-br from-steel-900 to-steel-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-nebula-cyan" />
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Energy Patterns</CardTitle>
              <CardDescription className="text-steel-400 text-sm">
                Track your energy across the week
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setWeekOffset(prev => prev - 1)}
              data-testid="button-prev-week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[100px] text-center">{label}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setWeekOffset(prev => Math.min(prev + 1, 0))}
              disabled={weekOffset >= 0}
              data-testid="button-next-week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mini Heatmap */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weekly Heatmap</h4>
          <div className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Header row with hours */}
              <div className="flex mb-1">
                <div className="w-10 shrink-0" />
                {[6, 9, 12, 15, 18, 21].map(hour => (
                  <div 
                    key={hour}
                    className="flex-1 text-center text-xs text-steel-500"
                    style={{ marginLeft: hour === 6 ? `${(6 / 24) * 100}%` : 0 }}
                  >
                    {formatHour(hour)}
                  </div>
                ))}
              </div>
              
              {/* Day rows */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <span className="w-10 text-xs text-steel-400 shrink-0">{day}</span>
                  <div className="flex-1 flex gap-px">
                    {HOURS.map(hour => {
                      const key = `${dayIndex}-${hour}`;
                      const cell = heatmapData.get(key);
                      const patternHint = patternHints.get(key);
                      
                      // Calculate intensity based on count (0.2 to 0.9 range)
                      const intensity = cell ? 0.2 + (cell.total / maxCount) * 0.7 : 0;
                      const level = cell?.dominantLevel || patternHint;
                      const levelStyle = level ? levelColors[level] : null;
                      
                      // Build style with dynamic opacity based on count
                      const bgStyle = levelStyle 
                        ? { backgroundColor: `rgba(${levelStyle.rgb}, ${intensity})` }
                        : undefined;
                      
                      const countLabel = cell ? ` (${cell.total} log${cell.total !== 1 ? 's' : ''})` : '';
                      
                      return (
                        <div
                          key={hour}
                          className={`h-4 flex-1 rounded-sm transition-all ${
                            level 
                              ? levelStyle?.glow 
                              : "bg-steel-800/50"
                          }`}
                          style={bgStyle}
                          title={level ? `${day} ${formatHour(hour)}: ${levelLabels[level]}${countLabel}` : `${day} ${formatHour(hour)}: No data`}
                          data-testid={`heatmap-cell-${dayIndex}-${hour}`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Legend */}
              <div className="flex items-center justify-end gap-4 mt-3">
                {(["low", "medium", "high"] as EnergyLevel[]).map(level => (
                  <div key={level} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${levelColors[level].bg}`} />
                    <span className="text-xs text-steel-400 capitalize">{level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {insights && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Your Patterns
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {insights.peakTime && (
                <div className="p-3 rounded-lg bg-steel-800/50 border border-steel-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-foreground">Peak Energy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insights.peakTime}
                  </p>
                </div>
              )}
              
              {insights.restTime && (
                <div className="p-3 rounded-lg bg-steel-800/50 border border-steel-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium text-foreground">Rest Needed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insights.restTime}
                  </p>
                </div>
              )}
              
              {insights.bestDay && (
                <div className="p-3 rounded-lg bg-steel-800/50 border border-steel-700/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-nebula-cyan" />
                    <span className="text-sm font-medium text-foreground">Best Day</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insights.bestDay}
                  </p>
                </div>
              )}
              
              {insights.suggestion && (
                <div className="p-3 rounded-lg bg-nebula-cyan/10 border border-nebula-cyan/20">
                  <p className="text-sm text-nebula-cyan italic">
                    {insights.suggestion}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Timeline */}
        {recentLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Logs</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentLogs.map((log) => {
                const date = new Date(log.loggedAt);
                const levelStyle = levelColors[log.level];
                
                return (
                  <div 
                    key={log.id}
                    className="flex items-center gap-3 text-sm"
                    data-testid={`energy-log-${log.id}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${levelStyle.bg} ${levelStyle.glow}`} />
                    <span className={`font-medium ${levelStyle.text}`}>
                      {levelLabels[log.level]}
                    </span>
                    <span className="text-steel-500 text-xs">
                      {date.toLocaleDateString("en-US", { weekday: "short" })} {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!logs?.length && (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              Start logging your energy to see patterns emerge
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function calculateInsights(patterns: EnergyPattern[]): {
  peakTime: string | null;
  restTime: string | null;
  bestDay: string | null;
  suggestion: string | null;
} {
  if (patterns.length === 0) {
    return { peakTime: null, restTime: null, bestDay: null, suggestion: null };
  }

  // Find peak energy times (high energy)
  const highPatterns = patterns.filter(p => p.dominantLevel === "high").sort((a, b) => b.count - a.count);
  const peakTime = highPatterns.length > 0 
    ? `Usually ${formatHour(highPatterns[0].hour)} on ${DAYS[highPatterns[0].dayOfWeek]}s`
    : null;

  // Find low energy times
  const lowPatterns = patterns.filter(p => p.dominantLevel === "low").sort((a, b) => b.count - a.count);
  const restTime = lowPatterns.length > 0
    ? `Around ${formatHour(lowPatterns[0].hour)} on ${DAYS[lowPatterns[0].dayOfWeek]}s`
    : null;

  // Find best day (most high energy patterns)
  const dayScores: Record<number, number> = {};
  for (const p of patterns) {
    const score = p.dominantLevel === "high" ? 2 : p.dominantLevel === "medium" ? 1 : 0;
    dayScores[p.dayOfWeek] = (dayScores[p.dayOfWeek] || 0) + score * p.count;
  }
  
  const bestDayIndex = Object.entries(dayScores)
    .sort(([, a], [, b]) => b - a)[0];
  
  const bestDay = bestDayIndex ? DAYS[parseInt(bestDayIndex[0])] : null;

  // Generate suggestion based on patterns
  let suggestion: string | null = null;
  if (highPatterns.length > 0 && lowPatterns.length > 0) {
    const peakHour = highPatterns[0].hour;
    if (peakHour >= 6 && peakHour < 12) {
      suggestion = "You're a morning person. Tackle challenging tasks early.";
    } else if (peakHour >= 12 && peakHour < 17) {
      suggestion = "Afternoons are your power hours. Save deep work for then.";
    } else {
      suggestion = "Evening energy is your strength. Consider that for important tasks.";
    }
  } else if (patterns.length < 10) {
    suggestion = "Keep logging to discover your energy patterns.";
  }

  return { peakTime, restTime, bestDay, suggestion };
}
