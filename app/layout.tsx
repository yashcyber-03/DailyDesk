import "./globals.css";
import type {Metadata} from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dailydesk.vercel.app"),
  title: {
    default: "DailyDesk – Everything you need. One simple workspace.",
    template: "%s | DailyDesk",
  },
  description: "Free online tools for documents, images, calculations and everyday productivity. No account needed.",
  openGraph: {
    title: "DailyDesk",
    description: "Free everyday online tools in one place.",
    type: "website",
  },
};

export default function Root({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-neutral-200 py-8 text-sm text-neutral-500 dark:border-neutral-800">
          <div className="mx-auto max-w-6xl px-4">
            <p><b>DailyDesk</b> – free everyday tools that run in your browser.</p>
            <p className="mt-1 flex flex-wrap gap-x-4">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/disclaimer">Disclaimer</Link>
              <Link href="/contact">Contact</Link>
            </p>
            <p className="mt-1">© {new Date().getFullYear()} DailyDesk</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
