import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Hammer, Check } from "lucide-react";

const effortLabels: Record<string, { label: string; color: string }> = {
  quick: { label: "Quick win", color: "text-green-400" },
  medium: { label: "Medium effort", color: "text-nebula-blue" },
  heavy: { label: "Deep work", color: "text-glow-purple" },
};

interface StepItem {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  effort: "quick" | "medium" | "heavy";
}

interface TheConstructProps {
  steps: StepItem[];
  onToggle: (id: number) => void;
}

export function TheConstruct({ steps, onToggle }: TheConstructProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <Card className="steel-card border-glow-purple/20 h-fit flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Hammer className="w-4 h-4 text-glow-purple" />
            <CardTitle className="text-sm">Sunroom Project</CardTitle>
          </div>
          <CardDescription className="text-xs">{progress}% complete</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4">
        <div className="relative h-2 rounded-full bg-steel-light/50 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-glow-purple to-nebula-cyan transition-all duration-500 progress-glow"
            style={{ width: `${progress}%` }}
            data-testid="progress-bar-construct"
          />
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {steps.map((step) => {
            const effort = effortLabels[step.effort];
            
            return (
              <div 
                key={step.id} 
                onClick={() => onToggle(step.id)} 
                className="cursor-pointer group"
                data-testid={`toggle-step-${step.id}`}
              >
                <div className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors ${step.completed ? "opacity-60" : "hover:bg-steel-light/30"}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`
                        w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                        ${step.completed 
                          ? "bg-glow-purple border-glow-purple" 
                          : "border-border/60 group-hover:border-glow-purple/60"
                        }
                      `}
                    >
                      {step.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium transition-all ${step.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {step.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{step.description}</span>
                      <span className={`text-xs ${effort.color}`}>{effort.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {progress === 100 && (
          <div className="text-center text-xs text-glow-purple italic pt-2 border-t border-border/30">
            Project complete. You built something real.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
