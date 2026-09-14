"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="ghost"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/account/logout", { method: "POST" });
        router.refresh();
      }}
    >
      {loading ? "Signing out…" : "Sign Out"}
    </Button>
  );
}
