import type { Metadata } from "next";
import { AdminPageClient } from "@/components/admin/admin-page-client";

export const metadata: Metadata = {
  title: "Admin • Mundough",
  description: "Manage hero tiles and storefront products for Mundough.",
};

export default function AdminPage() {
  return <AdminPageClient />;
}
