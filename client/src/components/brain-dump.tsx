import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Mic, MicOff, Plus, X, Clock, Search, Tag, 
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
  { value: "idea", label: "Idea", icon: Lightbulb, color: "text-amber-400" },
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

  // Persist entries to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sanctuary-dump', JSON.stringify(entries));
      } catch (e) {
        // Silently fail if localStorage is unavailable
      }
    }
  }, [entries]);

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
    return <Icon className={`w-4 h-4 ${cat.color} flex-shrink-0`} />;
  };

  const getTagName = (tagId: number) => {
    return tags.find(t => t.id === tagId)?.name || "Unknown";
  };

  const getTagColor = (tagId: number) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag?.color) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (tag.color === "nebula-cyan") return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    if (tag.color === "nebula-blue") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (tag.color === "nebula-purple") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
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
    <div className="flex-1 border border-white/10 rounded-lg p-6 bg-zinc-950/50 backdrop-blur flex flex-col min-h-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-semibold" data-testid="text-brain-dump-title">Brain_Dump</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">Unload_your_mind</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className={`${showFilters ? "text-blue-400" : "text-zinc-400"} hover:text-white transition`}
          data-testid="button-toggle-filters"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="mb-4 p-3 rounded-lg bg-zinc-900/50 border border-white/10 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search thoughts..."
                className="pl-9 bg-transparent border-white/10 text-sm placeholder:text-zinc-600"
                data-testid="input-search-thoughts"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  className={`cursor-pointer text-xs ${selectedCategory === cat.value ? "bg-blue-500/30 text-blue-400 border-blue-500/50" : "border-white/20 text-zinc-400 hover:border-white/40"}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat.value ? null : cat.value)}
                  data-testid={`filter-category-${cat.value}`}
                >
                  <cat.icon className="w-3 h-3 mr-1" />
                  {cat.label}
                </Badge>
              ))}
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className={`cursor-pointer text-xs ${selectedTags.includes(tag.id) ? getTagColor(tag.id) : "border-white/20 text-zinc-400"}`}
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

      {/* Input Area */}
      <div className="mb-6">
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/10 rounded px-4 py-3">
          <input
            type="text"
            placeholder="Add thought..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none placeholder-zinc-600 text-sm"
            data-testid="input-brain-dump"
          />
          <div className="flex items-center gap-2">
            {supportsVoice && (
              <button 
                onClick={handleVoiceCapture}
                className={`p-1.5 rounded transition ${isListening ? "bg-red-500/20 text-red-400" : "hover:bg-white/10"}`}
                data-testid="button-voice-capture"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-zinc-400" />}
              </button>
            )}
            <Popover open={showTagPopover} onOpenChange={setShowTagPopover}>
              <PopoverTrigger asChild>
                <button 
                  className={`p-1.5 hover:bg-white/10 rounded transition ${newTagIds.length > 0 || newCategory ? "text-blue-400" : ""}`}
                  data-testid="button-open-tags"
                >
                  <Tag className="w-4 h-4 text-zinc-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 bg-zinc-900 border-white/10" align="end">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-zinc-400">Category</div>
                  <div className="flex flex-wrap gap-1">
                    {CATEGORIES.map(cat => (
                      <Badge
                        key={cat.value}
                        variant={newCategory === cat.value ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${newCategory === cat.value ? "bg-blue-500/30 text-blue-400" : "border-white/20 text-zinc-400"}`}
                        onClick={() => setNewCategory(newCategory === cat.value ? null : cat.value)}
                        data-testid={`select-category-${cat.value}`}
                      >
                        <cat.icon className="w-3 h-3 mr-1" />
                        {cat.label}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-xs font-medium text-zinc-400">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                      <Badge
                        key={tag.id}
                        variant={newTagIds.includes(tag.id) ? "default" : "outline"}
                        className={`cursor-pointer text-xs ${newTagIds.includes(tag.id) ? getTagColor(tag.id) : "border-white/20 text-zinc-400"}`}
                        onClick={() => toggleNewTag(tag.id)}
                        data-testid={`select-tag-${tag.id}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="New tag..."
                      className="h-7 text-xs bg-transparent border-white/10"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                      data-testid="input-new-tag"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="h-7 px-2"
                      data-testid="button-create-tag"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <button 
              onClick={handleAddEntry}
              disabled={!textInput.trim()}
              className="p-1.5 hover:bg-white/10 rounded transition disabled:opacity-50"
              data-testid="button-add-thought"
            >
              <Plus className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
        
        {/* Selected category/tags preview */}
        <AnimatePresence>
          {(newCategory || newTagIds.length > 0) && (
            <motion.div 
              className="flex flex-wrap gap-1 mt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {newCategory && (
                <Badge variant="secondary" className="text-xs bg-zinc-800 text-zinc-300">
                  {getCategoryIcon(newCategory)}
                  <span className="ml-1">{CATEGORIES.find(c => c.value === newCategory)?.label}</span>
                  <button onClick={() => setNewCategory(null)} className="ml-1 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {newTagIds.map(tagId => (
                <Badge key={tagId} variant="secondary" className={`text-xs ${getTagColor(tagId)}`}>
                  {getTagName(tagId)}
                  <button onClick={() => toggleNewTag(tagId)} className="ml-1 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thoughts List */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {filteredEntries.length === 0 ? (
            <motion.div 
              className="text-center py-8 text-sm text-zinc-500"
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
                className="p-4 border border-white/10 rounded bg-zinc-900/30 hover:bg-zinc-900/50 transition cursor-pointer group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  delay: index * 0.02
                }}
                layout
              >
                <div className="flex items-start gap-3">
                  {entry.category ? (
                    getCategoryIcon(entry.category)
                  ) : (
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white break-words">{entry.text}</p>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {entry.tagIds?.map(tagId => (
                        <span
                          key={tagId}
                          className={`px-2 py-1 text-xs rounded border ${getTagColor(tagId)}`}
                          data-testid={`entry-tag-${entry.id}-${tagId}`}
                        >
                          {getTagName(tagId)}
                        </span>
                      ))}
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions (visible on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="p-1.5 text-zinc-500 hover:text-blue-400 transition-colors"
                          data-testid={`button-edit-tags-${entry.id}`}
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 bg-zinc-900 border-white/10" align="end">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-zinc-400">Edit Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {tags.map(tag => (
                              <Badge
                                key={tag.id}
                                variant={(entry.tagIds || []).includes(tag.id) ? "default" : "outline"}
                                className={`cursor-pointer text-xs ${(entry.tagIds || []).includes(tag.id) ? getTagColor(tag.id) : "border-white/20 text-zinc-400"}`}
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
                    
                    <button
                      onClick={() => onArchive(entry.id)}
                      className="p-1.5 text-zinc-500 hover:text-amber-400 transition-colors"
                      data-testid={`button-archive-${entry.id}`}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      data-testid={`button-delete-thought-${entry.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-xs text-zinc-500 mt-4 text-center">
        {filteredEntries.length} of {entries.length} thoughts
      </div>
    </div>
  );
}
