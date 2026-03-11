// =============================================================================
// AUHMS Shared TypeScript Types
//
// Re-exports Prisma-generated types and defines application-level types used
// across API routes, server components, and client components.
// =============================================================================

// Re-export all Prisma model types and enums for use across the app
export type {
  Building,
  Room,
  Student,
  HousingApplication,
  RoommatePreference,
  RoomAssignment,
  MaintenanceRequest,
  Lease,
  BillingCharge,
  AuditLog,
} from "@prisma/client";

export {
  UserRole,
  BuildingStatus,
  RoomType,
  RoomStatus,
  ApplicationStatus,
  AssignmentStatus,
  MaintenancePriority,
  MaintenanceStatus,
  LeaseStatus,
  AuditAction,
} from "@prisma/client";

// =============================================================================
// API Response shape
// =============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// User / Session context
// =============================================================================

// The effective user performing an action — pulled from the NextAuth session
// and threaded through API routes for RBAC and audit logging.
export interface RequestUser {
  id: string;          // NextAuth session user ID
  azureAdId: string;   // Azure AD OID — used in audit_log
  email: string;
  name?: string;
  role?: import("@prisma/client").UserRole;
}

// =============================================================================
// Colleague ERP Integration
// =============================================================================

// Shape of a student record as received from the Colleague nightly sync.
// Exact field names TBD pending Colleague API/export investigation.
export interface ColleagueSyncStudent {
  colleagueId: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string; // ISO 8601 date string
  phone?: string;
  enrollmentStatus?: string;
}

// =============================================================================
// Term utilities
// =============================================================================

// Term identifiers follow the pattern YYYY + FA/SP/SU (e.g. "2025FA", "2026SP").
// The exact format should be confirmed with Housing before first migration.
export type Term = string;
