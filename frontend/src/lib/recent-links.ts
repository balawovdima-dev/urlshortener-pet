import type { Link } from "./api";

const STORAGE_KEY = "recent-links";
const MAX_LINKS = 20;
const CHANGE_EVENT = "recent-links-change";
const EMPTY: Link[] = [];

let cachedRaw: string | null = null;
let cachedLinks: Link[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): Link[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? (data as Link[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// Returns a stable reference until storage actually changes (required by useSyncExternalStore).
export function getRecentLinks(): Link[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLinks = parse(raw);
  }
  return cachedLinks;
}

export function getServerRecentLinks(): Link[] {
  return EMPTY;
}

export function subscribeRecentLinks(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function write(links: Link[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch {
    // Storage may be full or disabled (e.g. private mode); ignore.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function addRecentLink(link: Link): void {
  const rest = getRecentLinks().filter((l) => l.code !== link.code);
  write([link, ...rest].slice(0, MAX_LINKS));
}

export function removeRecentLink(code: string): void {
  write(getRecentLinks().filter((l) => l.code !== code));
}

export function clearRecentLinks(): void {
  write([]);
}
