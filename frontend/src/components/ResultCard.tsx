import NextLink from "next/link";
import type { Link } from "@/lib/api";
import { CopyButton } from "./CopyButton";

export function ResultCard({ link }: { link: Link }) {
  return (
    <section
      aria-label="Your short link"
      className="card border-emerald-200 dark:border-emerald-900"
    >
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
        Your short link is ready
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={link.short_url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate font-mono text-lg font-semibold hover:underline"
        >
          {link.short_url}
        </a>
        <CopyButton text={link.short_url} />
      </div>
      <p className="mt-3 truncate text-sm text-zinc-500 dark:text-zinc-400">
        → <span title={link.target_url}>{link.target_url}</span>
      </p>
      <NextLink
        href={`/stats/${encodeURIComponent(link.code)}`}
        className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline"
      >
        View stats →
      </NextLink>
    </section>
  );
}
