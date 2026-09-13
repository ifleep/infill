"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Loads the 34-item demo catalog into the database — for hosts that give no
 * shell/SSH access, so `npm run db:seed` can never be run directly. Safe to
 * click more than once (upserts, doesn't duplicate).
 */
export function SeedCatalogButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setState("error");
        setMessage(data?.error ?? `Request failed (${res.status})`);
        return;
      }
      setState("done");
      setMessage(`Seeded ${data.seeded} products.`);
      router.refresh();
    } catch {
      setState("error");
      setMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={handleClick} disabled={state === "loading"}>
        {state === "loading" ? "Seeding…" : "Seed Demo Catalog"}
      </Button>
      {message && (
        <span className={`text-xs ${state === "error" ? "text-destructive" : "text-ink-muted"}`}>
          {message}
        </span>
      )}
    </div>
  );
}
