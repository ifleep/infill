"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash } from "@phosphor-icons/react";
import { formatPKR } from "@/lib/format";

interface OrderRow {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: string;
  paymentStatus: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function AdminOrdersTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(order: OrderRow) {
    if (!confirm(`Delete order ${order.orderNumber}? This cannot be undone.`)) return;
    setDeleting(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch {
      alert("Failed to delete order.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="focus-ring font-medium text-blue-700 hover:text-blue-600"
                >
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-ink-faint">{new Date(o.createdAt).toLocaleDateString("en-PK")}</p>
              </td>
              <td className="px-4 py-3 text-ink-muted">{o.customerName}</td>
              <td className="tabular px-4 py-3 text-ink-muted">{o.itemCount}</td>
              <td className="tabular px-4 py-3 font-medium text-ink">{formatPKR(o.total)}</td>
              <td className="px-4 py-3 text-ink-muted">{statusLabels[o.status] ?? o.status}</td>
              <td className="px-4 py-3 text-ink-muted">{o.paymentStatus}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDelete(o)}
                  disabled={deleting === o.id}
                  aria-label={`Delete order ${o.orderNumber}`}
                  className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-destructive-tint hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash size={16} />
                </button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-faint">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
