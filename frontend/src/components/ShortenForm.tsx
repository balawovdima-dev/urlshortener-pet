"use client";

import { useState, type FormEvent } from "react";
import {
  ApiError,
  createLink,
  errorMessage,
  type FieldErrors,
  type Link,
} from "@/lib/api";
import { addRecentLink } from "@/lib/recent-links";
import { validateAlias, validateUrl } from "@/lib/validation";
import { ResultCard } from "./ResultCard";

export function ShortenForm() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Link>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const trimmedUrl = url.trim();
    const trimmedAlias = showAlias ? alias.trim() : "";
    const clientErrors: FieldErrors = {
      url: validateUrl(trimmedUrl),
      alias: validateAlias(trimmedAlias),
    };
    setFormError(undefined);
    if (clientErrors.url || clientErrors.alias) {
      setErrors(clientErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const link = await createLink({ url: trimmedUrl, alias: trimmedAlias });
      setResult(link);
      addRecentLink(link);
      setUrl("");
      setAlias("");
    } catch (err) {
      setResult(undefined);
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors);
        if (err.fieldErrors.alias) setShowAlias(true);
      } else {
        setFormError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url" className="text-sm font-medium">
            Long URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/very/long/path"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
            }}
            aria-invalid={Boolean(errors.url)}
            aria-describedby={errors.url ? "url-error" : undefined}
            className="input"
          />
          {errors.url && (
            <p id="url-error" className="field-error">
              {errors.url}
            </p>
          )}
        </div>

        {showAlias ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="alias" className="text-sm font-medium">
                Custom alias <span className="font-normal text-zinc-500">(optional)</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowAlias(false);
                  setAlias("");
                  setErrors((prev) => ({ ...prev, alias: undefined }));
                }}
                className="text-xs text-zinc-500 hover:underline"
              >
                Remove
              </button>
            </div>
            <input
              id="alias"
              name="alias"
              type="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="my-link"
              maxLength={32}
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value);
                if (errors.alias) setErrors((prev) => ({ ...prev, alias: undefined }));
              }}
              aria-invalid={Boolean(errors.alias)}
              aria-describedby={errors.alias ? "alias-error" : "alias-hint"}
              className="input font-mono"
            />
            {errors.alias ? (
              <p id="alias-error" className="field-error">
                {errors.alias}
              </p>
            ) : (
              <p id="alias-hint" className="text-xs text-zinc-500">
                3–32 characters: letters, numbers, _ and -
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAlias(true)}
            className="self-start text-sm text-zinc-600 hover:underline dark:text-zinc-400"
          >
            + Add custom alias
          </button>
        )}

        {formError && (
          <p role="alert" className="alert-error">
            {formError}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Shortening…" : "Shorten"}
        </button>
      </form>

      {result && <ResultCard link={result} />}
    </div>
  );
}
