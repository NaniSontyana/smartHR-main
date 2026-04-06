import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-coral))",
  "hsl(var(--chart-blue))",
  "hsl(var(--chart-peach))",
  "hsl(var(--chart-orange))",
];

export function AttritionPieChart({ title, data, dataKey, nameKey }) {
  const chartData = data.map((item) => ({
    ...item,
    name: item[nameKey],
    value: item.employees,
  }));

  return (
    <Card className="p-5 card-shadow">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, attritionRate }) => `${attritionRate}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value, name, props) => [
                `${props.payload.attritionRate}% attrition (${value} employees)`,
                props.payload.name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px" }}>
                  {entry.payload.name}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default AttritionPieChart;
