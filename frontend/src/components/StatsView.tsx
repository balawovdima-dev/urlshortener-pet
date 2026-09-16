"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { ApiError, errorMessage, getLink, type Link } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { CopyButton } from "./CopyButton";

type State =
  | { status: "loading" }
  | { status: "ready"; link: Link }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function StatsView({ code }: { code: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getLink(code)
      .then((link) => {
        if (!cancelled) setState({ status: "ready", link });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ status: "not-found" });
        } else {
          setState({ status: "error", message: errorMessage(err) });
        }
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code, reloadKey]);

  function refresh() {
    setRefreshing(true);
    setReloadKey((k) => k + 1);
  }

  if (state.status === "loading") {
    return (
      <div className="card animate-pulse" aria-busy="true">
        <div className="h-6 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-3 h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-6 h-10 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="card text-center">
        <p className="text-4xl font-semibold">404</p>
        <h1 className="mt-2 text-lg font-semibold">Link not found</h1>
        <p className="mt-1 text-sm text-zinc-500">
          There is no short link with the code{" "}
          <code className="font-mono">{code}</code>.
        </p>
        <NextLink href="/" className="btn-primary mt-6 inline-flex">
          Create a short link
        </NextLink>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="card">
        <p role="alert" className="alert-error">
          {state.message}
        </p>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="btn-secondary mt-4"
        >
          {refreshing ? "Retrying…" : "Try again"}
        </button>
      </div>
    );
  }

  const { link } = state;

  return (
    <div className="card flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Short URL
        </p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
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
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Target URL
        </p>
        <a
          href={link.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-sm hover:underline"
        >
          {link.target_url}
        </a>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/60">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Clicks
          </dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums">
            {link.clicks.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/60">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Created
          </dt>
          <dd className="mt-1 text-sm font-medium">
            <time dateTime={link.created_at}>{formatDate(link.created_at)}</time>
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={refresh}
        disabled={refreshing}
        className="btn-secondary self-start"
      >
        {refreshing ? "Refreshing…" : "Refresh"}
      </button>
    </div>
  );
}
