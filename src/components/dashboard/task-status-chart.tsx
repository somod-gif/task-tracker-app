import { TrendingUp } from "lucide-react";
import { PieChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataPoint = {
  label: string;
  value: number;
  colorClass: string;
};

export function TaskStatusChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: DataPoint[];
}) {
  const total = data.reduce((sum, point) => sum + point.value, 0);
  const topBucket = [...data].sort((a, b) => b.value - a.value)[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="size-4" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <TrendingUp className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-xl font-semibold">{total}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Largest Segment</p>
            <p className="text-xl font-semibold">{topBucket?.label ?? "N/A"}</p>
          </div>
        </div>

        {data.map((point) => {
          const percentage = total ? Math.round((point.value / total) * 100) : 0;
          return (
            <div key={point.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{point.label}</span>
                <span className="font-medium">{point.value} ({percentage}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted">
                <div
                  className={cn("h-2.5 rounded-full transition-all", point.colorClass)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
