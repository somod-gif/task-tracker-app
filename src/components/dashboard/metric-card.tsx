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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-bold">
          {value}
          {subtitle ? <span className="ml-1 text-base font-semibold text-muted-foreground">{subtitle}</span> : null}
        </p>
        {helper ? <CardDescription>{helper}</CardDescription> : null}
      </CardContent>
    </Card>
  );
}
