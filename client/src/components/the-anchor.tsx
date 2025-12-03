import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor as AnchorIcon, Droplets, Smartphone, BookOpen } from "lucide-react";
import type { Anchor } from "@shared/schema";

const anchorIcons: Record<number, typeof Droplets> = {
  1: Droplets,
  2: Smartphone,
  3: BookOpen,
};

interface TheAnchorProps {
  anchors: Anchor[];
  onToggle: (id: number) => void;
}

export function TheAnchor({ anchors, onToggle }: TheAnchorProps) {
  const activeCount = anchors.filter((a) => a.active).length;

  return (
    <Card className="steel-card border-none overflow-hidden relative">
      <div className="subtle-grid absolute inset-0 pointer-events-none" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <AnchorIcon className="w-4 h-4 text-nebula-cyan" />
            The Anchor
          </CardTitle>
          <span 
            className="text-xs font-semibold text-nebula-cyan px-2 py-1 rounded-full bg-nebula-cyan/10 border border-nebula-cyan/30"
            data-testid="text-anchor-progress"
          >
            {activeCount}/{anchors.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 relative z-10">
        {anchors.map((anchor) => {
          const Icon = anchorIcons[anchor.id] || Droplets;
          
          return (
            <div 
              key={anchor.id} 
              onClick={() => onToggle(anchor.id)} 
              className="group cursor-pointer"
              data-testid={`toggle-anchor-${anchor.id}`}
            >
              <div
                className={`
                  relative h-14 rounded-lg flex items-center px-4 gap-3 transition-all duration-300
                  ${anchor.active 
                    ? "metal-switch-active" 
                    : "metal-switch hover:border-steel-light/60"
                  }
                `}
              >
                <div
                  className={`
                    absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-all duration-300
                    ${anchor.active ? "bg-nebula-cyan glow-bar" : "bg-transparent"}
                  `}
                />

                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${anchor.active ? "text-nebula-cyan" : "text-muted-foreground"}`} />

                <span
                  className={`flex-1 font-medium transition-colors ${anchor.active ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {anchor.label}
                </span>

                <div
                  className={`
                    w-3 h-3 rounded-full transition-all duration-500
                    ${anchor.active ? "bg-nebula-cyan glow-dot" : "bg-steel-light"}
                  `}
                />
              </div>
            </div>
          );
        })}
        
        {activeCount === anchors.length && (
          <div className="text-center text-xs text-nebula-cyan/80 italic mt-2 animate-fade-in">
            All anchors set. You're grounded.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
