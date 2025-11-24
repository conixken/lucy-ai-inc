import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Brain, Trash2, Clock, TrendingUp } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMemoryManager } from "@/hooks/useMemoryManager";
import { formatDistanceToNow } from "date-fns";

interface MemoryPanelProps {
  userId: string;
}

export const MemoryPanel = ({ userId }: MemoryPanelProps) => {
  const { memories, loading, deleteMemory } = useMemoryManager(userId);
  const [open, setOpen] = useState(false);

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'conversation': return <Clock className="h-3 w-3" />;
      case 'preference': return <TrendingUp className="h-3 w-3" />;
      default: return <Brain className="h-3 w-3" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          <span>Memories</span>
          {memories.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
              {memories.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Lucy's Memory Bank
          </SheetTitle>
          <SheetDescription>
            Important information Lucy has learned about you and your conversations
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-12rem)] mt-6">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading memories...
            </div>
          ) : memories.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No memories stored yet. Lucy will remember important information from your conversations.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {memories.map((memory) => (
                <Card key={memory.id} className="p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getMemoryIcon(memory.memory_type)}
                          <span className="ml-1">{memory.memory_type}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {memory.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${memory.importance_score * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(memory.importance_score * 100)}%
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => deleteMemory(memory.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};