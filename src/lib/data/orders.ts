import { prisma } from "@/lib/db";

// 250 PKR/kg, capped at 2500 PKR — the cap kicks in naturally at 10kg
// (10 * 250 = 2500), so a single min() covers both halves of the rule.
const SHIPPING_COST_PER_KG = 250;
const SHIPPING_COST_CAP = 2500;
// Applied when a product's weight hasn't been entered in the admin yet.
// Printers already carry real seeded weights; the products actually missing
// one today are filaments, which are standard 1kg spools — so this is a
// reasonable default for the common case, not just a placeholder. Admins
// should still set a real weight for anything unusually heavy or light.
const FALLBACK_ITEM_WEIGHT_KG = 1;

export interface CheckoutLineInput {
  productId: string;
  /** When set, this line is a specific ProductVariant — price/stock come from that variant, not the product's own fields. */
  variantId?: string;
  quantity: number;
}

export interface CheckoutAddressInput {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
}

export interface CreateOrderInput {
  customerId: string | null;
  guestEmail: string;
  guestPhone: string;
  address: CheckoutAddressInput;
  paymentMethod: "cod" | "transfer";
  lines: CheckoutLineInput[];
}

export class OrderError extends Error {}

export async function getAllOrders() {
  return prisma.order.findMany({
    include: { items: true, customer: true },
    orderBy: { createdAt: "desc" },
  });
}

// e.g. INF-260924-4821 — today's date plus 4 random digits, so an order
// number is legible at a glance (roughly when it was placed) rather than
// an opaque 6-digit string, while staying short enough to read over the
// phone or write on a shipping label.
function generateOrderNumber(): string {
  const datePart = new Date()
    .toLocaleDateString("en-CA", { year: "2-digit", month: "2-digit", day: "2-digit", timeZone: "Asia/Karachi" })
    .replace(/-/g, "");
  const digits = crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
  return `INF-${datePart}-${String(digits).padStart(4, "0")}`;
}

// Prices, stock, and totals are always recomputed server-side from the
// database — the client only sends product ids and quantities, so a
// tampered cart can't change what's charged or oversell stock.
export async function createOrder(input: CreateOrderInput) {
  if (input.lines.length === 0) throw new OrderError("Your cart is empty.");

  return prisma.$transaction(async (tx) => {
    const productIds = input.lines.map((l) => l.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    let totalWeightKg = 0;
    const items: {
      productId: string;
      productName: string;
      sku: string | null;
      unitPrice: number;
      quantity: number;
      total: number;
    }[] = [];
    // Which variant's stock to decrement, per product — collected separately
    // from `items` since a variant purchase doesn't touch Product.stock at all.
    const variantDecrements: { variantId: string; quantity: number }[] = [];

    for (const line of input.lines) {
      const product = productMap.get(line.productId);
      if (!product) throw new OrderError(`A product in your cart is no longer available.`);
      if (line.quantity < 1) throw new OrderError(`Invalid quantity for ${product.name}.`);

      const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : undefined;
      if (line.variantId && !variant) {
        throw new OrderError(`A configuration of ${product.name} in your cart is no longer available.`);
      }

      const name = variant ? `${product.name} (${variant.label})` : product.name;
      const price = variant ? variant.price : product.price;
      const sku = variant ? (variant.sku ?? product.sku) : product.sku;

      // Deliberately no stock/availability check here — out-of-stock and
      // preorder items are both orderable (backordered against the admin's
      // existing stock field, which can go negative to reflect demand
      // ahead of real inventory). See this session's discussion: the store
      // wants to always take the order and handle fulfillment timing with
      // the customer directly rather than block the purchase outright.
      const lineTotal = price * line.quantity;
      subtotal += lineTotal;
      totalWeightKg += (product.weightKg ?? FALLBACK_ITEM_WEIGHT_KG) * line.quantity;
      items.push({
        productId: product.id,
        productName: name,
        sku,
        unitPrice: price,
        quantity: line.quantity,
        total: lineTotal,
      });
      if (variant) variantDecrements.push({ variantId: variant.id, quantity: line.quantity });
    }

    const shippingCost = Math.min(Math.round(totalWeightKg * SHIPPING_COST_PER_KG), SHIPPING_COST_CAP);
    const total = subtotal + shippingCost;

    let orderNumber = generateOrderNumber();
    for (let attempt = 0; attempt < 5; attempt++) {
      const clash = await tx.order.findUnique({ where: { orderNumber } });
      if (!clash) break;
      orderNumber = generateOrderNumber();
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: input.customerId,
        guestEmail: input.customerId ? null : input.guestEmail,
        guestName: input.customerId ? null : input.address.fullName,
        guestPhone: input.customerId ? null : input.guestPhone,
        status: "pending",
        paymentStatus: "unpaid",
        paymentMethod: input.paymentMethod === "cod" ? "cod" : "bank_transfer",
        shippingAddress: { ...input.address, phone: input.guestPhone || input.address.phone },
        subtotal,
        shippingCost,
        total,
        items: { create: items },
      },
      include: { items: true },
    });

    for (const line of input.lines) {
      // A variant line doesn't touch Product.stock at all — with variants,
      // that column is just a stale write-time snapshot the app never reads
      // (see fromRow in products.ts), so decrementing it would be a no-op
      // that only confuses anyone inspecting the raw row. soldCount isn't
      // variant-specific though — it's a product-level "N sold" social
      // proof number (see sold-count.tsx), so it increments either way.
      await tx.product.update({
        where: { id: line.productId },
        data: {
          soldCount: { increment: line.quantity },
          ...(line.variantId ? {} : { stock: { decrement: line.quantity } }),
        },
      });
    }
    for (const dec of variantDecrements) {
      await tx.productVariant.update({
        where: { id: dec.variantId },
        data: { stock: { decrement: dec.quantity } },
      });
    }

    if (input.customerId) {
      await tx.customerAddress.updateMany({ where: { customerId: input.customerId }, data: { isDefault: false } });
      await tx.customerAddress.create({
        data: {
          customerId: input.customerId,
          fullName: input.address.fullName,
          phone: input.guestPhone || input.address.phone,
          line1: input.address.address,
          city: input.address.city,
          province: input.address.province,
          country: "Pakistan",
          isDefault: true,
        },
      });
    }

    return order;
  });
}
