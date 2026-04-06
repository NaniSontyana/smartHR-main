import { Card } from "@/components/ui/card";
import { MoreHorizontal, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DepartmentRiskTable({ title, data, subtitle }) {
    // Sort data by attrition rate descending if not already sorted
    const sortedData = [...(data || [])].sort((a, b) => (b.attritionRate || 0) - (a.attritionRate || 0));

    if (!sortedData || sortedData.length === 0) {
        return (
            <Card className="flex items-center justify-center p-6 h-64 text-muted-foreground bg-muted/20 border-dashed">
                No department data available
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden p-0 card-shadow h-full hover:shadow-lg transition-all duration-300 flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-rose-500" />

            <div className="p-6 pb-2 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-foreground text-lg">{title}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th className="py-3 px-6 pl-6">Department</th>
                            <th className="py-3 px-4 text-right">Headcount</th>
                            <th className="py-3 px-4 text-right">At Risk</th>
                            <th className="py-3 px-6 pr-6 w-[35%]">Attrition Risk</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {sortedData.map((item, index) => {
                            const rate = item.attritionRate || 0;
                            const isHigh = rate > 25;
                            const isMedium = rate > 15;

                            const barColor = isHigh
                                ? "bg-rose-500"
                                : isMedium
                                    ? "bg-amber-500"
                                    : "bg-emerald-500";

                            const textColor = isHigh
                                ? "text-rose-600 dark:text-rose-400"
                                : isMedium
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-emerald-600 dark:text-emerald-400";

                            return (
                                <tr key={item.department || index} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-6 font-medium text-foreground">
                                        {item.department || "Unknown"}
                                    </td>
                                    <td className="py-3 px-4 text-right text-muted-foreground">
                                        <div className="flex items-center justify-end gap-2">
                                            <Users className="h-3 w-3 opacity-50" />
                                            {item.total || item.employees || 0}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="inline-flex items-center gap-1.5 min-w-[3rem] justify-end">
                                            {item.highRisk > 0 && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                                            <span>{item.highRisk || 0}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className={`font-bold ${textColor}`}>{rate}%</span>
                                                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                                                    {isHigh ? "Critical" : isMedium ? "Warning" : "Safe"}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
                                                    style={{ width: `${Math.min(rate, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

export default DepartmentRiskTable;
