"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ToolSearch } from "@/components/layout/tool-search";
import { categories } from "@/config/categories";

const navLinks = [
  { href: "/tools", label: "All Tools" },
  ...categories.map((c) => ({ href: c.href, label: c.name })),
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center gap-4">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 xl:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden w-72 md:block">
          <ToolSearch />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t xl:hidden">
          <div className="container space-y-4 py-4">
            <div className="md:hidden">
              <ToolSearch onNavigate={() => setOpen(false)} />
            </div>
            <nav aria-label="Mobile" className="grid gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
