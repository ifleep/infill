import type { Metadata } from "next";
import { User } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <User size={40} weight="thin" className="text-ink-faint" />
      <h1 className="font-display text-2xl font-semibold text-ink">Sign in to your account</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Track orders, save addresses, and check out faster next time. Account sign-in is coming soon.
      </p>
      <Button disabled>Sign In (Coming Soon)</Button>
    </div>
  );
}
