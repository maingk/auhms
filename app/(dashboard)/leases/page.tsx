// Leases module — placeholder
// Entity: leases (ARCHITECTURE.md §6.1)
// Formal lease record tied to a room_assignment.
// Actual document is stored in SharePoint via Microsoft Graph API;
// only the SharePoint URL is stored in this table.
//
// Status lifecycle: DRAFT → SENT → SIGNED | EXPIRED | TERMINATED
//
// TODO: Implement lease list, generate lease from assignment, upload to
// SharePoint (Graph API), track signing status, expiration alerts.
// Requires: HOUSING_ADMIN or HOUSING_STAFF role.

export const metadata = {
  title: "Leases — AUHMS",
};

export default function LeasesPage() {
  return (
    <div>
      <h1>Leases</h1>
      <p style={{ color: "#6b7280" }}>
        Lease records linked to room assignments. Documents stored in
        SharePoint. Placeholder — implementation pending.
      </p>
    </div>
  );
}
