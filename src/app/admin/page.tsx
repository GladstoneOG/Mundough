import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("@/components/admin/admin-dashboard").then((mod) => mod.AdminDashboard), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Admin • Mundough",
  description: "Manage hero tiles and storefront products for Mundough.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
