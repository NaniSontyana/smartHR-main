import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

export function RadarAnalysisChart({ title, data, nameKey, dataKey = "value" }) {
  const chartData = data.map((item) => ({ ...item, subject: item[nameKey], fullMark: 100 }));

  return (
    <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-400" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-purple))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--chart-indigo))" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", padding: "12px 16px" }}
              formatter={(value, name, props) => [`${value}% attrition`, "Rate"]}
            />
            <Radar name="Attrition" dataKey={dataKey} stroke="hsl(var(--chart-purple))" strokeWidth={2} fill="url(#radarGradient)" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default RadarAnalysisChart;
