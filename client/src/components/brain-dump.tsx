import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Mic, MicOff, Plus, X, Clock } from "lucide-react";

interface BrainDumpEntryItem {
  id: number;
  text: string;
  timestamp: string;
}

interface BrainDumpProps {
  entries: BrainDumpEntryItem[];
  onAdd: (text: string) => void;
  onDelete: (id: number) => void;
}

export function BrainDump({ entries, onAdd, onDelete }: BrainDumpProps) {
  const [textInput, setTextInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleAddEntry = () => {
    if (!textInput.trim()) return;
    onAdd(textInput.trim());
    setTextInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddEntry();
    }
  };

  const handleVoiceCapture = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setTextInput(prev => prev + (prev ? " " : "") + transcript);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const supportsVoice = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  return (
    <Card className="steel-card border-nebula-blue/20 h-fit flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-nebula-blue" />
          <CardTitle className="text-sm">Brain Dump</CardTitle>
        </div>
        <CardDescription className="text-xs">Capture before it disappears</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add thought..."
            className="flex-1 bg-steel-light/50 border-border/50 text-sm placeholder:text-muted-foreground focus:ring-nebula-blue/50 focus:border-nebula-blue/50"
            data-testid="input-brain-dump"
          />
          
          {supportsVoice && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleVoiceCapture}
              className={isListening ? "bg-destructive/20 text-destructive" : ""}
              data-testid="button-voice-capture"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            onClick={handleAddEntry}
            disabled={!textInput.trim()}
            className="text-nebula-blue hover:text-nebula-blue"
            data-testid="button-add-thought"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {entries.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Your mind is clear. For now.
            </div>
          ) : (
            entries.slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                data-testid={`card-brain-dump-${entry.id}`}
                className="flex items-start gap-2 p-2.5 rounded-lg steel-surface border border-border/30 hover:border-nebula-blue/30 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{entry.text}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  data-testid={`button-delete-thought-${entry.id}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        
        {entries.length > 6 && (
          <div className="text-center text-xs text-muted-foreground">
            +{entries.length - 6} more thoughts captured
          </div>
        )}
      </CardContent>
    </Card>
  );
}
