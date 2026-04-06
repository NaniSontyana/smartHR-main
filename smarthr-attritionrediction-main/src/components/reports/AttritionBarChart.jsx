import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export function AttritionBarChart({ title, data, dataKeyX, dataKeyY = "attritionRate", color = "hsl(var(--chart-coral))" }) {
  return (
    <Card className="p-5 card-shadow">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 50]}
            />
            <YAxis
              type="category"
              dataKey={dataKeyX}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value, name, props) => [
                `${value}% (${props.payload.employees} employees)`,
                "Attrition Rate",
              ]}
            />
            <Bar dataKey={dataKeyY} radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry[dataKeyY] > 30 ? "hsl(var(--chart-coral))" : entry[dataKeyY] > 20 ? "hsl(var(--chart-orange))" : "hsl(var(--chart-blue))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default AttritionBarChart;
