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

function generateOrderNumber(): string {
  const digits = crypto.getRandomValues(new Uint32Array(1))[0] % 900000;
  return `INF-${100000 + digits}`;
}

// Prices, stock, and totals are always recomputed server-side from the
// database — the client only sends product ids and quantities, so a
// tampered cart can't change what's charged or oversell stock.
export async function createOrder(input: CreateOrderInput) {
  if (input.lines.length === 0) throw new OrderError("Your cart is empty.");

  return prisma.$transaction(async (tx) => {
    const productIds = input.lines.map((l) => l.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
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

    for (const line of input.lines) {
      const product = productMap.get(line.productId);
      if (!product) throw new OrderError(`A product in your cart is no longer available.`);
      if (line.quantity < 1) throw new OrderError(`Invalid quantity for ${product.name}.`);
      if (product.availability === "out-of-stock" || product.stock < line.quantity) {
        throw new OrderError(`${product.name} doesn't have enough stock left (only ${product.stock} available).`);
      }
      const lineTotal = product.price * line.quantity;
      subtotal += lineTotal;
      totalWeightKg += (product.weightKg ?? FALLBACK_ITEM_WEIGHT_KG) * line.quantity;
      items.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: line.quantity,
        total: lineTotal,
      });
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
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.quantity } },
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
