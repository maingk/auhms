import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Navigation items — one per core module defined in ARCHITECTURE.md §6
// Note: (dashboard) is a route group, so URLs have no /dashboard prefix.
const navItems = [
  { href: "/buildings", label: "Buildings" },
  { href: "/rooms", label: "Rooms" },
  { href: "/students", label: "Students" },
  { href: "/applications", label: "Applications" },
  { href: "/assignments", label: "Assignments" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/leases", label: "Leases" },
  { href: "/billing", label: "Billing" },
  { href: "/audit", label: "Audit Log" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Belt-and-suspenders check — middleware handles this, but verify in layout too
  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 220,
          borderRight: "1px solid #e5e7eb",
          padding: "1rem",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <strong>AUHMS</strong>
          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {session.user?.email}
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {navItems.map((item) => (
            <li key={item.href} style={{ marginBottom: "0.25rem" }}>
              <a
                href={item.href}
                style={{
                  display: "block",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "#374151",
                  fontSize: "0.875rem",
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          <a
            href="/api/auth/signout"
            style={{ fontSize: "0.875rem", color: "#6b7280" }}
          >
            Sign out
          </a>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
