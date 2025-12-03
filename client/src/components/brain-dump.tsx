import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Brain, Mic, MicOff, Plus, X, Clock, Search, Tag, 
  Lightbulb, CheckCircle, Bell, FileText, Filter, Archive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Tag as TagType, BrainDumpEntry } from "@shared/schema";

interface BrainDumpProps {
  entries: BrainDumpEntry[];
  tags: TagType[];
  onAdd: (text: string, category?: string, tagIds?: number[]) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: { tagIds?: number[]; category?: string }) => void;
  onArchive: (id: number) => void;
  onCreateTag: (name: string) => void;
}

const CATEGORIES = [
  { value: "idea", label: "Idea", icon: Lightbulb, color: "text-yellow-400" },
  { value: "task", label: "Task", icon: CheckCircle, color: "text-green-400" },
  { value: "reminder", label: "Reminder", icon: Bell, color: "text-orange-400" },
  { value: "note", label: "Note", icon: FileText, color: "text-blue-400" },
];

export function BrainDump({ entries, tags, onAdd, onDelete, onUpdate, onArchive, onCreateTag }: BrainDumpProps) {
  const [textInput, setTextInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [newTagIds, setNewTagIds] = useState<number[]>([]);
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const recognitionRef = useRef<any>(null);

  const handleAddEntry = () => {
    if (!textInput.trim()) return;
    onAdd(textInput.trim(), newCategory || undefined, newTagIds.length > 0 ? newTagIds : undefined);
    setTextInput("");
    setNewCategory(null);
    setNewTagIds([]);
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

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    onCreateTag(newTagName.trim());
    setNewTagName("");
  };

  const toggleNewTag = (tagId: number) => {
    setNewTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleFilterTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleEntryTag = (entryId: number, currentTagIds: number[], tagId: number) => {
    const newIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId];
    onUpdate(entryId, { tagIds: newIds });
  };

  const supportsVoice = typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const filteredEntries = entries.filter(entry => {
    if (searchQuery) {
      if (!entry.text.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    if (selectedCategory && entry.category !== selectedCategory) {
      return false;
    }
    if (selectedTags.length > 0) {
      const entryTags = entry.tagIds || [];
      if (!selectedTags.some(tagId => entryTags.includes(tagId))) {
        return false;
      }
    }
    return true;
  });

  const getCategoryIcon = (category: string | null) => {
    const cat = CATEGORIES.find(c => c.value === category);
    if (!cat) return null;
    const Icon = cat.icon;
    return <Icon className={`w-3 h-3 ${cat.color}`} />;
  };

  const getTagName = (tagId: number) => {
    return tags.find(t => t.id === tagId)?.name || "Unknown";
  };

  const getTagColor = (tagId: number) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag?.color) return "bg-nebula-blue/20 text-nebula-blue";
    if (tag.color === "nebula-cyan") return "bg-cyan-500/20 text-cyan-400";
    if (tag.color === "nebula-blue") return "bg-blue-500/20 text-blue-400";
    if (tag.color === "nebula-purple") return "bg-purple-500/20 text-purple-400";
    return "bg-nebula-blue/20 text-nebula-blue";
  };

  const formatTimestamp = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <Card className="glass-card border-nebula-blue/20 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-nebula-blue" />
            <CardTitle className="text-sm">Brain Dump</CardTitle>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "text-nebula-blue" : "text-muted-foreground"}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">Unload your mind...</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 flex-1 flex flex-col">
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              className="space-y-2 p-2 rounded-lg steel-surface border border-border/30"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thoughts..."
                  className="pl-8 h-8 text-xs bg-background/50 border-border/50"
                  data-testid="input-search-thoughts"
                />
              </div>
              
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(cat => (
                  <Badge
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    className={`cursor-pointer text-xs ${selectedCategory === cat.value ? "bg-nebula-blue/30" : ""}`}
                    onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                    data-testid={`filter-category-${cat.value}`}
                  >
                    <cat.icon className="w-3 h-3 mr-1" />
                    {cat.label}
                  </Badge>
                ))}
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${selectedTags.includes(tag.id) ? getTagColor(tag.id) : ""}`}
                      onClick={() => toggleFilterTag(tag.id)}
                      data-testid={`filter-tag-${tag.id}`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add thought..."
                className="flex-1 bg-white/5 border-white/10 text-base placeholder:text-gray-600 focus:border-cyan-500/50"
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

              <Popover open={showTagPopover} onOpenChange={setShowTagPopover}>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={newTagIds.length > 0 ? "text-nebula-blue" : "text-muted-foreground"}
                    data-testid="button-open-tags"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Category</div>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.map(cat => (
                        <Badge
                          key={cat.value}
                          variant={newCategory === cat.value ? "default" : "outline"}
                          className={`cursor-pointer text-xs ${newCategory === cat.value ? "bg-nebula-blue/30" : ""}`}
                          onClick={() => setNewCategory(newCategory === cat.value ? null : cat.value)}
                          data-testid={`select-category-${cat.value}`}
                        >
                          <cat.icon className="w-3 h-3 mr-1" />
                          {cat.label}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs font-medium text-muted-foreground mt-2">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {tags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant={newTagIds.includes(tag.id) ? "default" : "outline"}
                          className={`cursor-pointer text-xs ${newTagIds.includes(tag.id) ? getTagColor(tag.id) : ""}`}
                          onClick={() => toggleNewTag(tag.id)}
                          data-testid={`select-tag-${tag.id}`}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-1 mt-2">
                      <Input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="New tag..."
                        className="h-7 text-xs"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                        data-testid="input-new-tag"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                        className="h-7"
                        data-testid="button-create-tag"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
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
            
            <AnimatePresence>
              {(newCategory || newTagIds.length > 0) && (
                <motion.div 
                  className="flex flex-wrap gap-1"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {newCategory && (
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryIcon(newCategory)}
                      <span className="ml-1">{CATEGORIES.find(c => c.value === newCategory)?.label}</span>
                      <button onClick={() => setNewCategory(null)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {newTagIds.map(tagId => (
                    <Badge key={tagId} variant="secondary" className={`text-xs ${getTagColor(tagId)}`}>
                      {getTagName(tagId)}
                      <button onClick={() => toggleNewTag(tagId)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1 max-h-[300px]">
          <AnimatePresence mode="popLayout">
            {filteredEntries.length === 0 ? (
              <motion.div 
                className="text-center py-6 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {entries.length === 0 ? "Mind clear." : "No matching thoughts found."}
              </motion.div>
            ) : (
              filteredEntries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  data-testid={`card-brain-dump-${entry.id}`}
                  className="p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-nebula-blue/30 transition-colors group"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, x: 20 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 30,
                    delay: index * 0.02
                  }}
                  layout
                >
                  <div className="flex items-start gap-2">
                    {entry.category && (
                      <motion.div 
                        className="mt-0.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        {getCategoryIcon(entry.category)}
                      </motion.div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">{entry.text}</p>
                      
                      {(entry.tagIds && entry.tagIds.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {entry.tagIds.map(tagId => (
                            <Badge
                              key={tagId}
                              variant="secondary"
                              className={`text-xs cursor-pointer ${getTagColor(tagId)}`}
                              onClick={() => toggleEntryTag(entry.id, entry.tagIds || [], tagId)}
                              data-testid={`entry-tag-${entry.id}-${tagId}`}
                            >
                              {getTagName(tagId)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(entry.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="p-1 text-muted-foreground hover:text-nebula-blue transition-colors"
                            data-testid={`button-edit-tags-${entry.id}`}
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" align="end">
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground">Edit Tags</div>
                            <div className="flex flex-wrap gap-1">
                              {tags.map(tag => (
                                <Badge
                                  key={tag.id}
                                  variant={(entry.tagIds || []).includes(tag.id) ? "default" : "outline"}
                                  className={`cursor-pointer text-xs ${(entry.tagIds || []).includes(tag.id) ? getTagColor(tag.id) : ""}`}
                                  onClick={() => toggleEntryTag(entry.id, entry.tagIds || [], tag.id)}
                                  data-testid={`toggle-entry-tag-${entry.id}-${tag.id}`}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <motion.button
                        onClick={() => onArchive(entry.id)}
                        className="p-1 text-muted-foreground hover:text-yellow-500 transition-colors"
                        data-testid={`button-archive-${entry.id}`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </motion.button>
                      
                      <motion.button
                        onClick={() => onDelete(entry.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        data-testid={`button-delete-thought-${entry.id}`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {entries.length > 0 && (
          <motion.div 
            className="text-center text-xs text-muted-foreground pt-1 border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredEntries.length} of {entries.length} thoughts
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
