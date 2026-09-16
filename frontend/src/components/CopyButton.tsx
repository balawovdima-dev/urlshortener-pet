"use client";

import { useEffect, useRef, useState } from "react";

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back below.
  }
  // Fallback for non-secure contexts (e.g. plain http on a server IP).
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    const ok = await copyText(text);
    setStatus(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  const label =
    status === "copied" ? "Copied!" : status === "failed" ? "Failed" : "Copy";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-secondary min-w-[5.5rem] ${
        status === "copied" ? "text-emerald-600 dark:text-emerald-400" : ""
      } ${className}`}
    >
      <span aria-live="polite">{label}</span>
    </button>
  );
}
