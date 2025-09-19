import { PortfolioOverview } from "@/components/portfolio/PortfolioOverview";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Portfolio() {
  return (
    <DashboardLayout>
      <PortfolioOverview />
    </DashboardLayout>
  );
}