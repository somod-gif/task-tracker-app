import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  "Multi-tenant company governance",
  "Department and workforce management",
  "Sprint and backlog planning",
  "Task lifecycle orchestration",
  "Real-time + email notifications",
];

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Services</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service}>
            <CardHeader>
              <CardTitle className="text-base">{service}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Production-grade workflows tailored for enterprise program execution.
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
