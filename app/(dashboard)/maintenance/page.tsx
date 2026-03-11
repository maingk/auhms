// Maintenance Requests module — placeholder
// Entity: maintenance_requests (ARCHITECTURE.md §6.1)
// Submitted by students or staff against a specific room.
// Belongs to a room, not a student — rooms persist between tenants.
//
// Priority: LOW | MEDIUM | HIGH | EMERGENCY
// Status lifecycle: OPEN → IN_PROGRESS → RESOLVED → CLOSED
//
// TODO: Implement request list (filterable by room/building/priority/status),
// submit new request, update status, assign to staff member, add notes.
// Requires: STUDENT (submit own requests), HOUSING_STAFF (manage all requests).

export const metadata = {
  title: "Maintenance Requests — AUHMS",
};

export default function MaintenancePage() {
  return (
    <div>
      <h1>Maintenance Requests</h1>
      <p style={{ color: "#6b7280" }}>
        Maintenance requests by room. Placeholder — implementation pending.
      </p>
    </div>
  );
}
