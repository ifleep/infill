"use client";

import { useEffect, useState } from "react";

function format(msRemaining: number): string {
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return days > 0 ? `${days}d ${pad(hours)}h ${pad(minutes)}m` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** A live countdown to `saleEndsAt` — renders nothing once it's unset or already past. */
export function SaleTimer({ saleEndsAt, className = "" }: { saleEndsAt: string | undefined; className?: string }) {
  const target = saleEndsAt ? new Date(saleEndsAt).getTime() : null;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    // Kick off an immediate tick via a callback (not a direct call in the
    // effect body) so the timer shows right away instead of waiting a full
    // second for the first setInterval fire.
    const immediate = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(id);
    };
  }, [target]);

  // Nothing set, or not yet mounted (avoids a server/client render mismatch
  // since "time remaining" can only be computed once we're in the browser).
  if (!target || now === null) return null;
  const remaining = target - now;
  if (remaining <= 0) return null;

  return (
    <p className={`text-xs font-medium text-destructive ${className}`}>
      Sale ends in <span className="tabular">{format(remaining)}</span>
    </p>
  );
}
