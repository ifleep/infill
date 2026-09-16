import type { Metadata } from "next";
import { getCurrentCustomerId } from "@/lib/customer-auth";
import { getCustomerById, getCustomerAddresses } from "@/lib/data/customers";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const customerId = await getCurrentCustomerId();

  let initial: Partial<{ email: string; phone: string; fullName: string; address: string; city: string; province: string }> = {};
  if (customerId) {
    const [customer, addresses] = await Promise.all([getCustomerById(customerId), getCustomerAddresses(customerId)]);
    const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
    initial = {
      email: customer?.email ?? "",
      phone: customer?.phone ?? defaultAddress?.phone ?? "",
      fullName: defaultAddress?.fullName ?? customer?.name ?? "",
      address: defaultAddress?.line1 ?? "",
      city: defaultAddress?.city ?? "",
      province: defaultAddress?.province ?? undefined,
    };
  }

  return <CheckoutClient initial={initial} />;
}
