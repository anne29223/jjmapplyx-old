import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Target, Percent } from "lucide-react";

const mockData = [
  { name: 'Mon', applications: 4, responses: 1 },
  { name: 'Tue', applications: 3, responses: 0 },
  { name: 'Wed', applications: 5, responses: 2 },
  { name: 'Thu', applications: 2, responses: 1 },
  { name: 'Fri', applications: 6, responses: 3 },
  { name: 'Sat', applications: 1, responses: 0 },
  { name: 'Sun', applications: 0, responses: 0 }
];

const statusData = [
  { name: 'Pending', value: 65, color: '#8B5CF6' },
  { name: 'Applied', value: 20, color: '#10B981' },
  { name: 'Interview', value: 10, color: '#F59E0B' },
  { name: 'Rejected', value: 5, color: '#EF4444' }
];

export const Analytics = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Application Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applications" fill="hsl(var(--primary))" name="Applications" />
              <Bar dataKey="responses" fill="hsl(var(--accent))" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Application Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">Application Success Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-accent">2.5 hrs</div>
              <div className="text-sm text-muted-foreground">Avg. Time Saved/Day</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-success">12%</div>
              <div className="text-sm text-muted-foreground">Interview Rate</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-warning">3.2 days</div>
              <div className="text-sm text-muted-foreground">Avg. Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};