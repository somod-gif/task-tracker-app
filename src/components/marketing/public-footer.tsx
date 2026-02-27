import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Sprint Desk</p>
          <p className="text-sm text-muted-foreground">Premium enterprise sprint and task management for multi-tenant teams.</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Company</p>
          <Link href="/about" className="block text-muted-foreground transition-colors hover:text-primary">About</Link>
          <Link href="/services" className="block text-muted-foreground transition-colors hover:text-primary">Services</Link>
          <Link href="/testimonials" className="block text-muted-foreground transition-colors hover:text-primary">Testimonials</Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Resources</p>
          <Link href="/contact" className="block text-muted-foreground transition-colors hover:text-primary">Contact</Link>
          <Link href="/login" className="block text-muted-foreground transition-colors hover:text-primary">Login</Link>
          <Link href="/register-company" className="block text-muted-foreground transition-colors hover:text-primary">Register Your Company</Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Social</p>
          <p className="text-muted-foreground">LinkedIn</p>
          <p className="text-muted-foreground">X</p>
          <p className="text-muted-foreground">YouTube</p>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sprint Desk. All rights reserved.
      </div>
    </footer>
  );
}
