import { prisma } from "@/lib/db";
import { shippingCostForCity, type SiteSettings } from "@/lib/data/settings";

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
  paymentMethod: "cod" | "bank";
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

  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["shippingRates", "defaultShippingCost"] } },
  });
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return prisma.$transaction(async (tx) => {
    const productIds = input.lines.map((l) => l.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
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
      items.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: line.quantity,
        total: lineTotal,
      });
    }

    const shippingRates = (settingsMap.shippingRates as unknown as SiteSettings["shippingRates"] | undefined) ?? [];
    const defaultShippingCost = (settingsMap.defaultShippingCost as unknown as number | undefined) ?? 450;
    const shippingCost = shippingCostForCity(
      { shippingRates, defaultShippingCost } as SiteSettings,
      input.address.city
    );
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
