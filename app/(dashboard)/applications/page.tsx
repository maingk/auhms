// Housing Applications module — placeholder
// Entity: housing_applications (ARCHITECTURE.md §6.1)
// A student's application for housing for a given term.
// One application per student per term (enforced by unique constraint).
//
// Status lifecycle: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED | WAITLISTED | CANCELLED
//
// TODO: Implement application list (filterable by term/status), application
// detail view, status transitions, roommate preference review.
// Requires: HOUSING_ADMIN or HOUSING_STAFF to manage; STUDENT to submit.

export const metadata = {
  title: "Housing Applications — AUHMS",
};

export default function ApplicationsPage() {
  return (
    <div>
      <h1>Housing Applications</h1>
      <p style={{ color: "#6b7280" }}>
        Student housing applications by term. Placeholder — implementation
        pending.
      </p>
    </div>
  );
}
