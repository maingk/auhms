// Rooms module — placeholder
// Entity: rooms (ARCHITECTURE.md §6.1)
// Individual rooms within a building. Contains capacity, type, amenities, status.
//
// TODO: Implement room list with building filter, add/edit room, status management.
// Requires: HOUSING_ADMIN or HOUSING_STAFF role to view; HOUSING_ADMIN to modify.

export const metadata = {
  title: "Rooms — AUHMS",
};

export default function RoomsPage() {
  return (
    <div>
      <h1>Rooms</h1>
      <p style={{ color: "#6b7280" }}>
        Individual rooms within buildings. Placeholder — implementation pending.
      </p>
    </div>
  );
}
