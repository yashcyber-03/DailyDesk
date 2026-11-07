import Link from "next/link";
import { Logo } from "@/components/logo";
import { categories } from "@/config/categories";
import { siteConfig } from "@/config/site";
import { getPopularTools } from "@/lib/tools";

const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
];

export function Footer() {
  const popular = getPopularTools().slice(0, 6);
  return (
    <footer className="mt-24 border-t">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}</p>
        </div>
        <nav aria-label="Tool categories">
          <h2 className="text-sm font-medium">Categories</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}><Link href={c.href} className="hover:text-foreground">{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Popular tools">
          <h2 className="text-sm font-medium">Popular tools</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {popular.map((t) => (
              <li key={t.slug}><Link href={`/tools/${t.slug}`} className="hover:text-foreground">{t.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Explore">
          <h2 className="text-sm font-medium">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/tools" className="hover:text-foreground">All tools</Link></li>
            <li><Link href="/#faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="text-sm font-medium">Company</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {company.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-foreground">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <p className="container py-5 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
