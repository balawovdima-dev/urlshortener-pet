"use client";

import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export function BackendVersion() {
  const [text, setText] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((health) => {
        if (!cancelled) setText(`API v${health.version}`);
      })
      .catch(() => {
        if (!cancelled) setText("API unreachable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <span>{text ?? " "}</span>;
}
