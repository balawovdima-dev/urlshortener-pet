import { getApiUrl } from "./config";

export interface Link {
  code: string;
  short_url: string;
  target_url: string;
  clicks: number;
  created_at: string;
}

export interface CreateLinkInput {
  url: string;
  alias?: string;
}

export interface Health {
  status: string;
  version: string;
}

export type FormField = "url" | "alias";
export type FieldErrors = Partial<Record<FormField, string>>;

interface ValidationIssue {
  loc?: (string | number)[];
  msg?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function cleanMessage(msg: string): string {
  // Pydantic prefixes custom validator messages with "Value error, ".
  return msg.replace(/^Value error,\s*/, "");
}

async function toApiError(res: Response): Promise<ApiError> {
  let detail: unknown;
  try {
    detail = ((await res.json()) as { detail?: unknown }).detail;
  } catch {
    // Body wasn't JSON; fall through to a generic message.
  }

  if (typeof detail === "string") {
    const fieldErrors: FieldErrors = /alias/i.test(detail)
      ? { alias: detail }
      : {};
    return new ApiError(res.status, detail, fieldErrors);
  }

  if (Array.isArray(detail)) {
    const fieldErrors: FieldErrors = {};
    const messages: string[] = [];
    for (const issue of detail as ValidationIssue[]) {
      const msg = cleanMessage(issue.msg ?? "Invalid value");
      const field = issue.loc?.[issue.loc.length - 1];
      if ((field === "url" || field === "alias") && !fieldErrors[field]) {
        fieldErrors[field] = msg;
      }
      messages.push(msg);
    }
    return new ApiError(
      res.status,
      messages.join("; ") || "Validation failed",
      fieldErrors,
    );
  }

  return new ApiError(
    res.status,
    `Request failed with status ${res.status}`,
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const apiUrl = await getApiUrl();
  let res: Response;
  try {
    res = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      `Could not reach the API at ${apiUrl}. Is the backend running?`,
    );
  }

  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

export function createLink(input: CreateLinkInput): Promise<Link> {
  const body: CreateLinkInput = { url: input.url };
  if (input.alias) body.alias = input.alias;
  return request<Link>("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function getLink(code: string): Promise<Link> {
  return request<Link>(`/api/links/${encodeURIComponent(code)}`);
}

export function getHealth(): Promise<Health> {
  return request<Health>("/healthz");
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Please try again.";
}
