import { EmpireRoadmap } from "@/components/empire/EmpireRoadmap";

export default function EmpireRoadmapPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Empire Roadmap</h1>
        <p className="text-muted-foreground">
          Track your empire building progress through phases from foundation to operations.
        </p>
      </div>
      <EmpireRoadmap />
    </div>
  );
}