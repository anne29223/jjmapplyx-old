
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, CheckCircle, Clock, Zap, Webhook } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalJobs: number;
    applied: number;
    pending: number;
    successRate: number;
    automationRuns?: number;
    webhooksTriggered?: number;
  };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: "Total Jobs Found",
      value: (stats?.totalJobs || 0).toString(),
      icon: Target,
      color: "text-primary"
    },
    {
      title: "Auto Applied",
      value: (stats?.applied || 0).toString(),
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Pending Queue",
      value: (stats?.pending || 0).toString(),
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      color: "text-info"
    },
    {
      title: "Automation Runs",
      value: (stats?.automationRuns || 0).toString(),
      icon: Zap,
      color: "text-accent"
    },
    {
      title: "Webhooks Fired",
      value: (stats?.webhooksTriggered || 0).toString(),
      icon: Webhook,
      color: "text-primary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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
