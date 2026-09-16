"use client";

import NextLink from "next/link";
import { useSyncExternalStore } from "react";
import {
  clearRecentLinks,
  getRecentLinks,
  getServerRecentLinks,
  removeRecentLink,
  subscribeRecentLinks,
} from "@/lib/recent-links";
import { CopyButton } from "./CopyButton";

export function RecentLinks() {
  const links = useSyncExternalStore(
    subscribeRecentLinks,
    getRecentLinks,
    getServerRecentLinks,
  );

  if (links.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="recent-heading" className="text-sm font-semibold">
          Recent links
        </h2>
        <button
          type="button"
          onClick={clearRecentLinks}
          className="text-xs text-zinc-500 hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul className="card divide-y divide-zinc-200 p-0 dark:divide-zinc-800">
        {links.map((link) => (
          <li
            key={link.code}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <a
                href={link.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate font-mono text-sm font-medium hover:underline"
              >
                {link.short_url}
              </a>
              <p
                className="truncate text-xs text-zinc-500"
                title={link.target_url}
              >
                {link.target_url}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <CopyButton text={link.short_url} />
              <NextLink
                href={`/stats/${encodeURIComponent(link.code)}`}
                className="btn-secondary"
              >
                Stats
              </NextLink>
              <button
                type="button"
                onClick={() => removeRecentLink(link.code)}
                aria-label={`Remove ${link.short_url} from recent links`}
                className="btn-secondary px-2.5"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
