"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="focus-ring cursor-pointer text-sm font-medium text-ink-muted hover:text-destructive"
    >
      Sign out
    </button>
  );
}
