import { AIAssistant } from "@/components/empire/AIAssistant";

export default function AIAssistantPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights for empire strategy, deal analysis, and legal structures.
        </p>
      </div>
      <AIAssistant />
    </div>
  );
}