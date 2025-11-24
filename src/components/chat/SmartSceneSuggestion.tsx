import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface SmartSceneSuggestionProps {
  suggestedScene: string | null;
  onApply: (scene: string) => void;
  onDismiss: () => void;
}

export const SmartSceneSuggestion = ({ 
  suggestedScene, 
  onApply, 
  onDismiss 
}: SmartSceneSuggestionProps) => {
  useEffect(() => {
    if (suggestedScene) {
      toast.custom((t) => (
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Scene Suggestion</p>
              <p className="text-xs text-muted-foreground">
                Based on your conversation, the <span className="font-semibold text-foreground">{suggestedScene}</span> scene would enhance your experience.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    onApply(suggestedScene);
                    toast.dismiss(t);
                  }}
                  className="h-7 text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onDismiss();
                    toast.dismiss(t);
                  }}
                  className="h-7 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ), {
        duration: 10000,
        position: 'bottom-right'
      });
    }
  }, [suggestedScene]);

  return null;
};