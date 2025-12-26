import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, ChevronLeft, ChevronRight, Download, 
  Anchor, CheckSquare, Brain, Flame, BarChart3, TrendingUp,
  FileJson
} from "lucide-react";
import type { WeeklyReflection, EnergyPattern } from "@shared/schema";

function getStartOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", options)} - ${end.toLocaleDateString("en-US", options)}`;
}

function getEnergyLevelColor(level: string): string {
  switch (level) {
    case "high": return "text-green-400";
    case "medium": return "text-nebula-blue";
    case "low": return "text-yellow-400";
    default: return "text-muted-foreground";
  }
}

function getPeakEnergyInsight(patterns: EnergyPattern[]): string {
  if (!patterns.length) return "Keep logging to discover your patterns";
  
  const highEnergyPatterns = patterns.filter(p => p.dominantLevel === "high");
  if (!highEnergyPatterns.length) return "Log more high-energy moments to find your peak times";
  
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const hourCounts: Record<number, number> = {};
  
  highEnergyPatterns.forEach(p => {
    hourCounts[p.hour] = (hourCounts[p.hour] || 0) + p.count;
  });
  
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (!peakHour) return "Keep logging to discover your peak hours";
  
  const hour = parseInt(peakHour[0]);
  const timeStr = hour < 12 ? `${hour || 12}am` : `${hour === 12 ? 12 : hour - 12}pm`;
  
  return `Your energy peaks around ${timeStr}`;
}

function getRestInsight(patterns: EnergyPattern[]): string {
  if (!patterns.length) return "Track your energy to understand rest needs";
  
  const lowEnergyPatterns = patterns.filter(p => p.dominantLevel === "low");
  if (!lowEnergyPatterns.length) return "Great energy levels observed this week!";
  
  const hourCounts: Record<number, number> = {};
  lowEnergyPatterns.forEach(p => {
    hourCounts[p.hour] = (hourCounts[p.hour] || 0) + p.count;
  });
  
  const restHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  if (!restHour) return "Listen to your body for rest signals";
  
  const hour = parseInt(restHour[0]);
  const timeStr = hour < 12 ? `${hour || 12}am` : `${hour === 12 ? 12 : hour - 12}pm`;
  
  return `Consider scheduling rest around ${timeStr}`;
}

export function WeeklyReflections() {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>(() => getStartOfWeek());

  const { data: reflection, isLoading, error } = useQuery<WeeklyReflection>({
    queryKey: ["/api/reflection", currentWeekStart],
    queryFn: async () => {
      const res = await fetch(`/api/reflection?weekStart=${currentWeekStart}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reflection");
      return res.json();
    },
  });

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 7);
      return date.toISOString().split("T")[0];
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 7);
      const today = getStartOfWeek();
      if (date.toISOString().split("T")[0] <= today) {
        return date.toISOString().split("T")[0];
      }
      return prev;
    });
  }, []);

  const handleExportJSON = useCallback(async () => {
    try {
      const res = await fetch("/api/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `sanctuary-os-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, []);

  const handleExportCSV = useCallback(async () => {
    try {
      const res = await fetch("/api/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      
      const data = await res.json();
      
      const csvSections: string[] = [];
      
      if (data.energyLogs?.length) {
        csvSections.push("# Energy Logs");
        csvSections.push("id,level,loggedAt,note");
        data.energyLogs.forEach((log: any) => {
          csvSections.push(`${log.id},"${log.level}","${log.loggedAt}","${log.note || ""}"`);
        });
        csvSections.push("");
      }
      
      if (data.anchors?.length) {
        csvSections.push("# Anchors");
        csvSections.push("id,label,icon,sortOrder");
        data.anchors.forEach((a: any) => {
          csvSections.push(`${a.id},"${a.label}","${a.icon || ""}",${a.sortOrder || 0}`);
        });
        csvSections.push("");
      }
      
      if (data.anchorCompletions?.length) {
        csvSections.push("# Anchor Completions");
        csvSections.push("id,anchorId,completedDate,completedAt");
        data.anchorCompletions.forEach((ac: any) => {
          csvSections.push(`${ac.id},${ac.anchorId},"${ac.completedDate}","${ac.completedAt}"`);
        });
        csvSections.push("");
      }
      
      if (data.projectTemplates?.length) {
        csvSections.push("# Project Templates");
        csvSections.push("id,name,description,isDefault");
        data.projectTemplates.forEach((t: any) => {
          csvSections.push(`${t.id},"${t.name}","${t.description || ""}",${t.isDefault || false}`);
        });
        csvSections.push("");
      }
      
      if (data.templateSteps?.length) {
        csvSections.push("# Template Steps");
        csvSections.push("id,templateId,title,effort,sortOrder");
        data.templateSteps.forEach((s: any) => {
          csvSections.push(`${s.id},${s.templateId},"${s.title}","${s.effort || "medium"}",${s.sortOrder || 0}`);
        });
        csvSections.push("");
      }
      
      if (data.projects?.length) {
        csvSections.push("# Projects");
        csvSections.push("id,name,description,isActive");
        data.projects.forEach((p: any) => {
          csvSections.push(`${p.id},"${p.name}","${p.description || ""}",${p.isActive}`);
        });
        csvSections.push("");
      }
      
      if (data.projectSteps?.length) {
        csvSections.push("# Project Steps");
        csvSections.push("id,projectId,title,effort,completed");
        data.projectSteps.forEach((s: any) => {
          csvSections.push(`${s.id},${s.projectId},"${s.title}","${s.effort || "medium"}",${s.completed || false}`);
        });
        csvSections.push("");
      }
      
      if (data.tags?.length) {
        csvSections.push("# Tags");
        csvSections.push("id,name,color");
        data.tags.forEach((t: any) => {
          csvSections.push(`${t.id},"${t.name}","${t.color || ""}"`);
        });
        csvSections.push("");
      }
      
      if (data.brainDumpEntries?.length) {
        csvSections.push("# Brain Dump Entries");
        csvSections.push("id,text,category,tagIds,createdAt,archivedAt");
        data.brainDumpEntries.forEach((e: any) => {
          const tagIdsStr = (e.tagIds || []).join(";");
          csvSections.push(`${e.id},"${e.text.replace(/"/g, '""')}","${e.category || ""}","${tagIdsStr}","${e.createdAt}","${e.archivedAt || ""}"`);
        });
        csvSections.push("");
      }
      
      if (data.dailySummaries?.length) {
        csvSections.push("# Daily Summaries");
        csvSections.push("id,date,dominantEnergy,anchorsCompleted,tasksCompleted,thoughtsCaptured");
        data.dailySummaries.forEach((s: any) => {
          csvSections.push(`${s.id},"${s.date}","${s.dominantEnergy || ""}",${s.anchorsCompleted || 0},${s.tasksCompleted || 0},${s.thoughtsCaptured || 0}`);
        });
        csvSections.push("");
      }
      
      if (data.streak) {
        csvSections.push("# Streak");
        csvSections.push("currentStreak,longestStreak,lastActiveDate");
        csvSections.push(`${data.streak.currentStreak || 0},${data.streak.longestStreak || 0},"${data.streak.lastActiveDate || ""}"`);
        csvSections.push("");
      }
      
      if (data.settings) {
        csvSections.push("# Settings");
        csvSections.push("weeklyTarget,currentEnergyLevel");
        csvSections.push(`${data.settings.weeklyTarget || 35},"${data.settings.currentEnergyLevel || "medium"}"`);
      }
      
      const csvContent = csvSections.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `sanctuary-os-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  }, []);

  const isCurrentWeek = useMemo(
    () => currentWeekStart === getStartOfWeek(),
    [currentWeekStart]
  );

  const peakEnergyInsight = useMemo(
    () => reflection ? getPeakEnergyInsight(reflection.energyPatterns) : "",
    [reflection]
  );

  const restInsight = useMemo(
    () => reflection ? getRestInsight(reflection.energyPatterns) : "",
    [reflection]
  );

  if (isLoading) {
    return (
      <SpotlightCard className="steel-card border-glow-purple/20">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </SpotlightCard>
    );
  }

  if (error || !reflection) {
    return (
      <SpotlightCard className="steel-card border-glow-purple/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-glow-purple" />
            <CardTitle className="text-sm">Weekly Reflection</CardTitle>
          </div>
          <CardDescription className="text-xs">Your week at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-sm text-muted-foreground">
            Unable to load weekly reflection. Please try again later.
          </div>
        </CardContent>
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard className="steel-card border-glow-purple/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-glow-purple" />
            <CardTitle className="text-sm">Weekly Reflection</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={goToPreviousWeek}
              className="h-7 w-7"
              data-testid="button-prev-week"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[100px] text-center">
              {reflection ? formatDateRange(reflection.weekStart, reflection.weekEnd) : "Loading..."}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={goToNextWeek}
              disabled={isCurrentWeek}
              className="h-7 w-7"
              data-testid="button-next-week"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">Your week at a glance</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {reflection && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg steel-surface border border-border/30 text-center">
                <Anchor className="w-4 h-4 mx-auto mb-1 text-nebula-cyan" />
                <div className="text-lg font-bold text-foreground" data-testid="stat-anchors">
                  {reflection.totalAnchorsCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Anchors</div>
              </div>
              
              <div className="p-3 rounded-lg steel-surface border border-border/30 text-center">
                <CheckSquare className="w-4 h-4 mx-auto mb-1 text-green-400" />
                <div className="text-lg font-bold text-foreground" data-testid="stat-tasks">
                  {reflection.totalTasksCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
              
              <div className="p-3 rounded-lg steel-surface border border-border/30 text-center">
                <Brain className="w-4 h-4 mx-auto mb-1 text-nebula-blue" />
                <div className="text-lg font-bold text-foreground" data-testid="stat-thoughts">
                  {reflection.totalThoughtsCaptured}
                </div>
                <div className="text-xs text-muted-foreground">Thoughts</div>
              </div>
              
              <div className="p-3 rounded-lg steel-surface border border-border/30 text-center">
                <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                <div className="text-lg font-bold text-foreground" data-testid="stat-streak">
                  {reflection.streakDays}
                </div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-nebula-cyan" />
                <span className="text-xs font-medium text-muted-foreground">ENERGY INSIGHTS</span>
              </div>
              
              <div className="p-3 rounded-lg steel-surface border border-border/30 space-y-2">
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                  <p className="text-sm text-foreground">{peakEnergyInsight}</p>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="w-4 h-4 mt-0.5 text-yellow-400 shrink-0" />
                  <p className="text-sm text-foreground">{restInsight}</p>
                </div>
              </div>
            </div>

            {reflection.topTags && reflection.topTags.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">FOCUS AREAS</span>
                <div className="flex flex-wrap gap-1">
                  {reflection.topTags.map(tag => (
                    <Badge 
                      key={tag.tagId} 
                      variant="secondary" 
                      className="text-xs bg-glow-purple/20 text-glow-purple"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border/30 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="flex-1 text-xs"
                data-testid="button-export-json"
              >
                <FileJson className="w-3.5 h-3.5 mr-1.5" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex-1 text-xs"
                data-testid="button-export-csv"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </SpotlightCard>
  );
}
