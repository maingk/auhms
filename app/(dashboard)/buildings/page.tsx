// Buildings module — placeholder
// Entity: buildings (ARCHITECTURE.md §6.1)
// Physical buildings on campus. Parent of rooms.
//
// TODO: Implement building list, add/edit/archive building functionality.
// Requires: HOUSING_ADMIN or HOUSING_STAFF role to view; HOUSING_ADMIN to modify.

export const metadata = {
  title: "Buildings — AUHMS",
};

export default function BuildingsPage() {
  return (
    <div>
      <h1>Buildings</h1>
      <p style={{ color: "#6b7280" }}>
        Physical buildings on campus. Placeholder — implementation pending.
      </p>
    </div>
  );
}
