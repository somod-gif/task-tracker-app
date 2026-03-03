"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
];

export function PublicNavbar({ activePath }: { activePath: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      onClick={() => setIsMenuOpen(false)}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200
        after:absolute after:bottom-1 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2 
        after:bg-primary after:transition-all after:duration-300 after:content-[''] 
        hover:after:w-[calc(100%-2rem)]
        ${activePath === href 
          ? "text-primary after:w-[calc(100%-2rem)]" 
          : "text-muted-foreground hover:text-foreground"
        }`}
    >
      {label}
    </Link>
  );

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80" 
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        {/* Logo */}
        <Link 
          href="/" 
          className="group relative inline-flex items-center gap-2 transition-transform hover:scale-105"
          aria-label="Sprint Desk Home"
        >
          <Image 
            src="/sprint-desk-logo.png" 
            alt="Sprint Desk" 
            width={120} 
            height={40} 
            className="h-8 w-auto lg:h-10"
            priority
          />
          <span className="absolute -bottom-6 left-0 text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            Go to homepage
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button 
            asChild 
            variant="ghost" 
            size="sm"
            className="hidden lg:inline-flex hover:bg-primary/10 hover:text-primary"
          >
            <Link href="/register-company">Register Company</Link>
          </Button>
          <Button 
            asChild 
            size="sm"
            className="shadow-lg transition-all hover:shadow-primary/25"
          >
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border bg-background md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <div className="relative h-4 w-4">
            <span 
              className={`absolute left-0 top-0 h-0.5 w-full bg-foreground transition-all duration-300 ${
                isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : ""
              }`} 
            />
            <span 
              className={`absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-foreground transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`} 
            />
            <span 
              className={`absolute bottom-0 left-0 h-0.5 w-full bg-foreground transition-all duration-300 ${
                isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : ""
              }`} 
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMenuOpen 
            ? "pointer-events-auto opacity-100" 
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Side Panel */}
      <div 
        className={`fixed right-0 top-0 z-50 h-full w-[280px] bg-background shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Side Panel Header */}
          <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
            <span className="text-sm font-semibold">Menu</span>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"
              aria-label="Close menu"
            >
              <div className="relative h-4 w-4">
                <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rotate-45 bg-foreground" />
                <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-45 bg-foreground" />
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Mobile navigation">
            <div className="space-y-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    activePath === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Action Buttons */}
          <div className="border-t border-border/70 p-4">
            <div className="flex flex-col gap-3">
              <Button 
                asChild 
                variant="outline" 
                size="default" 
                className="w-full"
              >
                <Link href="/register-company" onClick={() => setIsMenuOpen(false)}>
                  Register Company
                </Link>
              </Button>
              <Button 
                asChild 
                size="default" 
                className="w-full"
              >
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}