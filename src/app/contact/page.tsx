import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicShell } from "@/components/marketing/public-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ReadingProgress } from "@/components/marketing/reading-progress";

export default function ContactPage() {
  return (
    <PublicShell activePath="/contact">
      <ReadingProgress />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <h1 className="animate-in fade-in slide-in-from-bottom-3 text-3xl font-bold tracking-tight duration-500">Contact</h1>
        <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500 md:grid-cols-2">
          <Card className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your full name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="you@company.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help your company?" />
              </div>
              <Button size="sm">Submit</Button>
            </CardContent>
          </Card>
          <Card className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Email: sales@sprintdesk.com</p>
              <p>Phone: +1 (555) 010-2030</p>
              <p>Address: 100 Enterprise Avenue, Suite 400</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicShell>
  );
}
