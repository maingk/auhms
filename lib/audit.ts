import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// =============================================================================
// Audit Logging — FERPA Compliance
//
// Every read and write of student records must produce an audit_log entry.
// Call writeAuditLog() from API route handlers and server actions whenever
// student data is accessed or modified.
//
// audit_log records are immutable — they are never updated or soft-deleted.
// =============================================================================

interface AuditEntry {
  userId: string;      // Azure AD user ID (oid claim)
  userEmail: string;   // Captured at time of action
  action: AuditAction;
  tableName: string;
  recordId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      user_id: entry.userId,
      user_email: entry.userEmail,
      action: entry.action,
      table_name: entry.tableName,
      record_id: entry.recordId ?? null,
      old_values: entry.oldValues ?? null,
      new_values: entry.newValues ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
    },
  });
}

// Convenience helpers for common operations

export function auditRead(
  userId: string,
  userEmail: string,
  tableName: string,
  recordId?: string
) {
  return writeAuditLog({
    userId,
    userEmail,
    action: AuditAction.READ,
    tableName,
    recordId,
  });
}

export function auditCreate(
  userId: string,
  userEmail: string,
  tableName: string,
  recordId: string,
  newValues: Record<string, unknown>
) {
  return writeAuditLog({
    userId,
    userEmail,
    action: AuditAction.CREATE,
    tableName,
    recordId,
    newValues,
  });
}

export function auditUpdate(
  userId: string,
  userEmail: string,
  tableName: string,
  recordId: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
) {
  return writeAuditLog({
    userId,
    userEmail,
    action: AuditAction.UPDATE,
    tableName,
    recordId,
    oldValues,
    newValues,
  });
}

export function auditDelete(
  userId: string,
  userEmail: string,
  tableName: string,
  recordId: string,
  oldValues: Record<string, unknown>
) {
  return writeAuditLog({
    userId,
    userEmail,
    action: AuditAction.DELETE,
    tableName,
    recordId,
    oldValues,
  });
}
