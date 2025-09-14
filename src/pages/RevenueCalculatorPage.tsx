import { RevenueCalculator } from "@/components/empire/RevenueCalculator";

export default function RevenueCalculatorPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Revenue Calculator</h1>
        <p className="text-muted-foreground">
          Model and plan your three-pillar revenue streams with interactive scenario planning.
        </p>
      </div>
      <RevenueCalculator />
    </div>
  );
}