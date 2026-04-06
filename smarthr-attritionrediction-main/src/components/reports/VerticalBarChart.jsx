import { Card } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const COLORS = [
    "hsl(var(--chart-blue))",
    "hsl(var(--chart-indigo))",
    "hsl(var(--chart-violet))",
    "hsl(var(--chart-purple))",
    "hsl(var(--chart-pink))",
    "hsl(var(--chart-rose))",
];

import { useMemo } from "react";
// ... imports

export function VerticalBarChart({ title, data, dataKeyX, dataKeyY = "attritionRate", subtitle }) {
    const maxVal = useMemo(() => Math.max(...data.map((d) => d[dataKeyY] || 0)), [data, dataKeyY]);

    return (
        <Card className="relative overflow-hidden p-6 card-shadow h-full hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-400" />
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis
                            dataKey={dataKeyX}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                padding: "12px 16px",
                            }}
                            cursor={{ fill: "hsl(var(--muted))/0.2" }}
                            formatter={(value, name, props) => [`${value}%`, `Attrition Rate (${props.payload.total || 0} emp)`]}
                        />
                        <Bar dataKey={dataKeyY} radius={[4, 4, 0, 0]} maxBarSize={50}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    fillOpacity={0.9}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}

export default VerticalBarChart;
