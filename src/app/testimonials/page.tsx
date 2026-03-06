import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicShell } from "@/components/marketing/public-shell";
import { ReadingProgress } from "@/components/marketing/reading-progress";

const quotes = [
  {
    author: "Head of PMO",
    company: "Enterprise Manufacturing Group",
    quote: "Sprint Desk gave us clear governance from platform oversight to department delivery.",
  },
  {
    author: "Operations Director",
    company: "Digital Services Holding",
    quote: "Our sprint assignment and escalation process is now measurable and consistent.",
  },
];

export default function TestimonialsPage() {
  return (
    <PublicShell activePath="/testimonials">
      <ReadingProgress />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <h1 className="animate-in fade-in slide-in-from-bottom-3 text-3xl font-bold tracking-tight duration-500">Testimonials</h1>
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500 md:grid-cols-2">
          {quotes.map((item) => (
            <Card key={item.author}>
              <CardHeader>
                <CardTitle className="text-base">{item.author}</CardTitle>
                <p className="text-xs text-muted-foreground">{item.company}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">“{item.quote}”</CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-in fade-in slide-in-from-bottom-3 duration-500">
          <CardHeader>
            <CardTitle>Ratings & Trust</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Average rating: 4.9/5 from enterprise teams.</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border px-2 py-1 text-xs">SOC-ready workflows</span>
              <span className="rounded-md border px-2 py-1 text-xs">Multi-tenant secure architecture</span>
              <span className="rounded-md border px-2 py-1 text-xs">Role-based audit coverage</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </PublicShell>
  );
}
