import { PortfolioManager } from "@/components/empire/PortfolioManager";

export default function PortfolioManagerPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Portfolio Manager</h1>
        <p className="text-muted-foreground">
          Manage your portfolio companies, track performance, and monitor deal pipeline.
        </p>
      </div>
      <PortfolioManager />
    </div>
  );
}