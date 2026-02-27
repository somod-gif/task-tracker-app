import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
];

export function PublicNavbar({ activePath }: { activePath: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:py-4">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image src="/sprint-desk-logo.png" alt="Sprint Desk" width={100} height={32} />
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                activePath === item.href
                  ? "rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                  : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden min-w-24 sm:inline-flex">
            <Link href="/register-company">Register</Link>
          </Button>
          <Button asChild className="min-w-20 shadow-sm">
            <Link href="/login">Login</Link>
          </Button>
          <details className="group md:hidden">
            <summary className="list-none">
              <Button type="button" variant="outline" size="sm" className="h-9 w-9 p-0" aria-label="Open navigation menu">
                <Menu className="size-4" />
              </Button>
            </summary>
            <div className="absolute left-0 right-0 top-full z-50 border-b border-border/70 bg-background/95 px-4 py-4 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/90">
              <nav className="mx-auto grid max-w-7xl gap-2">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      activePath === item.href
                        ? "rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                        : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                    }
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/register-company">Register</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
