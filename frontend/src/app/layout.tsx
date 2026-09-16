import type { Metadata } from "next";
import NextLink from "next/link";
import { BackendVersion } from "@/components/BackendVersion";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "URL Shortener",
    template: "%s · URL Shortener",
  },
  description: "Shorten long URLs and track clicks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-4">
            <NextLink href="/" className="font-semibold tracking-tight">
              ✂️ URL Shortener
            </NextLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:py-12">
          {children}
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-2xl justify-between px-4 py-4 text-xs text-zinc-500">
            <span>URL Shortener</span>
            <BackendVersion />
          </div>
        </footer>
      </body>
    </html>
  );
}
