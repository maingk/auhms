// Room Assignments module — placeholder
// Entity: room_assignments (ARCHITECTURE.md §6.1)
// Active link between a student and a specific room for a term.
// One student, one room, one term — enforced at application level.
// A room can have many assignments across terms but only one ACTIVE at a time.
//
// FERPA NOTE: All access and modifications must be logged in audit_log.
// Soft deletes only — assignment history must be preserved.
//
// TODO: Implement assignment list (by term/room/student), create/cancel
// assignment, view assignment history, generate lease from assignment.
// Requires: HOUSING_ADMIN or HOUSING_STAFF role.

export const metadata = {
  title: "Room Assignments — AUHMS",
};

export default function AssignmentsPage() {
  return (
    <div>
      <h1>Room Assignments</h1>
      <p style={{ color: "#6b7280" }}>
        Student room assignments by term. Placeholder — implementation pending.
      </p>
      <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
        All assignment changes are logged for FERPA compliance. Records are
        soft-deleted only.
      </p>
    </div>
  );
}
