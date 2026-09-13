import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/data/products";

// Public, read-only catalog feed for client components that can't query
// the database directly (search overlay, compare page, the printer quiz).
// The catalog is small (dozens of items), so shipping it whole is simpler
// than building per-use-case filtered endpoints.
export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json(products);
}
