import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
      <Card>
        <CardHeader>
          <CardTitle>Talk to Sprint Desk Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Email: sales@sprintdesk.com</p>
          <p>Phone: +1 (555) 010-2030</p>
          <p>Address: 100 Enterprise Avenue, Suite 400</p>
        </CardContent>
      </Card>
    </main>
  );
}
