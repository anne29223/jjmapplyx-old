import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, CheckCircle, Clock } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalJobs: number;
    applied: number;
    pending: number;
    successRate: number;
  };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: "Total Jobs Found",
      value: stats.totalJobs.toString(),
      icon: Target,
      color: "text-primary"
    },
    {
      title: "Applications Sent",
      value: stats.applied.toString(),
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Pending Review",
      value: stats.pending.toString(),
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Success Rate",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "text-info"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};