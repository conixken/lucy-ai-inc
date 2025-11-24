import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Database, Users, Activity } from "lucide-react";

export const SystemDashboard = () => {
  const systemStats = {
    toolsAvailable: 7,
    activeModels: 8,
    memoryBanks: 'Active',
    contextEngine: 'Running',
    realtime: 'Connected'
  };

  const features = [
    { name: 'Advanced Reasoning', icon: Brain, status: 'active', color: 'text-blue-500' },
    { name: 'Image Generation', icon: Zap, status: 'active', color: 'text-purple-500' },
    { name: 'Web Search', icon: Activity, status: 'active', color: 'text-green-500' },
    { name: 'Code Execution', icon: Database, status: 'active', color: 'text-orange-500' },
    { name: 'Memory Manager', icon: Users, status: 'active', color: 'text-pink-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Lucy AI System Status</h2>
        <p className="text-muted-foreground">All systems operational</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tools Available</p>
              <p className="text-2xl font-bold">{systemStats.toolsAvailable}</p>
            </div>
            <Brain className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">AI Models</p>
              <p className="text-2xl font-bold">{systemStats.activeModels}</p>
            </div>
            <Zap className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Memory Banks</p>
              <p className="text-2xl font-bold">{systemStats.memoryBanks}</p>
            </div>
            <Database className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-3">
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="font-medium">{feature.name}</span>
              </div>
              <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                {feature.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <h3 className="text-lg font-semibold mb-2">System Capabilities</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✨ Advanced chain-of-thought reasoning with google/gemini-2.5-pro</li>
          <li>🎨 AI image generation and editing</li>
          <li>🔍 Real-time web search integration</li>
          <li>💻 Sandboxed code execution (Python & JavaScript)</li>
          <li>🧠 Persistent memory and context analysis</li>
          <li>🎯 Proactive suggestions and smart scene recommendations</li>
          <li>🌐 Multimodal analysis (images, audio, video, documents)</li>
          <li>⚡ Real-time streaming responses</li>
        </ul>
      </Card>
    </div>
  );
};