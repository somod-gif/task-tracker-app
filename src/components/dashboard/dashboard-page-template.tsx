import { RefreshCw, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StatItem = {
  label: string;
  value: string | number;
};

export function DashboardPageTemplate({
  title,
  description,
  stats,
  actions,
}: {
  title: string;
  description: string;
  stats: StatItem[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_45%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions ?? (
            <>
              <Button variant="outline" size="sm" aria-label="Refresh dashboard">
                <RefreshCw className="size-4" />
              </Button>
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                New
              </Button>
            </>
          )}
        </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="border-border/70 bg-card/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle>Main Section</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Card grid, table, or board content goes here based on page use case.
        </CardContent>
      </Card>
    </div>
  );
}
