// Audit Log module — placeholder
// Entity: audit_log (ARCHITECTURE.md §6.1)
// Immutable log of all access to and changes of student records.
// Required for FERPA compliance — records are never soft-deleted.
//
// Every read and write of student records produces an entry via lib/audit.ts.
// Columns: user_id, user_email, action, table_name, record_id, old_values,
//          new_values, ip_address, user_agent, created_at.
//
// TODO: Implement audit log viewer with filters (by user, action, date range,
// table, record ID). Read-only — no create/update/delete from UI.
// Requires: IT_ADMIN or HOUSING_ADMIN role (sensitive access log).

export const metadata = {
  title: "Audit Log — AUHMS",
};

export default function AuditPage() {
  return (
    <div>
      <h1>Audit Log</h1>
      <p style={{ color: "#6b7280" }}>
        Immutable log of all student record access and changes (FERPA
        compliance). Placeholder — implementation pending.
      </p>
      <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
        Audit records are never deleted or modified. Access restricted to IT
        Admin and Housing Admin roles.
      </p>
    </div>
  );
}
