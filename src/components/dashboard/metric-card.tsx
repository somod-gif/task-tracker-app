import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  subtitle,
  helper,
}: {
  title: string;
  value: number;
  subtitle?: string;
  helper?: string;
}) {
  return (
    <Card className="border-border/70 bg-card/75 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-2xl font-bold tracking-tight md:text-3xl">
          {value}
          {subtitle ? <span className="ml-1 text-base font-semibold text-muted-foreground">{subtitle}</span> : null}
        </p>
        {helper ? <CardDescription className="text-xs">{helper}</CardDescription> : null}
      </CardContent>
    </Card>
  );
}
