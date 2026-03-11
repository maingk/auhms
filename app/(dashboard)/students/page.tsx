// Students module — placeholder
// Entity: students (ARCHITECTURE.md §6.1)
// Sourced from Colleague ERP via nightly batch sync — never created manually.
// UUID maps to Colleague student ID.
//
// FERPA NOTE: All access to student records must be logged in audit_log.
// RLS policies in Supabase restrict access at the database layer.
//
// TODO: Implement student list (read-only from AUHMS perspective), search by
// name/Colleague ID, view student housing history.
// Requires: HOUSING_ADMIN or HOUSING_STAFF role minimum.

export const metadata = {
  title: "Students — AUHMS",
};

export default function StudentsPage() {
  return (
    <div>
      <h1>Students</h1>
      <p style={{ color: "#6b7280" }}>
        Student records sourced from Colleague ERP via nightly sync. Placeholder
        — implementation pending.
      </p>
      <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
        All access to student records is logged for FERPA compliance.
      </p>
    </div>
  );
}
