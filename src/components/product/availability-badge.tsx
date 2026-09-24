import { CheckCircle, Clock, XCircle } from "@phosphor-icons/react/ssr";
import type { Availability } from "@/lib/types";

const config: Record<Availability, { label: string; textClass: string; Icon: typeof CheckCircle }> = {
  "in-stock": { label: "In stock", textClass: "text-pk-green", Icon: CheckCircle },
  preorder: { label: "Available for preorder", textClass: "text-blue-700", Icon: Clock },
  "out-of-stock": { label: "Currently unavailable", textClass: "text-destructive", Icon: XCircle },
};

/** "Available for preorder" -> "Available for preorder (~25 days)" — same label everywhere a lead time is known, so it's opt-in via an optional prop rather than every caller having to pass it. */
function labelFor(availability: Availability, preorderLeadDays?: number): string {
  if (availability === "preorder" && preorderLeadDays) {
    return `${config.preorder.label} (~${preorderLeadDays} days)`;
  }
  return config[availability].label;
}

/** Small pill for product cards / listing grids. */
export function AvailabilityBadge({
  availability,
  preorderLeadDays,
}: {
  availability: Availability;
  preorderLeadDays?: number;
}) {
  const { textClass, Icon } = config[availability];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${textClass}`}>
      <Icon size={13} weight="fill" />
      {labelFor(availability, preorderLeadDays)}
    </span>
  );
}

/** Fuller status line for the product detail page, including stock count when in stock. */
export function AvailabilityStatus({
  availability,
  stock,
  preorderLeadDays,
}: {
  availability: Availability;
  stock: number;
  preorderLeadDays?: number;
}) {
  const { textClass, Icon } = config[availability];
  const label = availability === "in-stock" ? `In stock — ${stock} available` : labelFor(availability, preorderLeadDays);
  return (
    <p className={`flex items-center gap-1.5 text-sm ${textClass}`}>
      <Icon size={16} weight="fill" />
      {label}
    </p>
  );
}
