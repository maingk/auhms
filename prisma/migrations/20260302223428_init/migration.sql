-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('HOUSING_ADMIN', 'HOUSING_STAFF', 'STUDENT', 'IT_ADMIN', 'READ_ONLY_REPORTER');

-- CreateEnum
CREATE TYPE "building_status" AS ENUM ('ACTIVE', 'INACTIVE', 'UNDER_RENOVATION');

-- CreateEnum
CREATE TYPE "room_type" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'SUITE', 'APARTMENT');

-- CreateEnum
CREATE TYPE "room_status" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'WAITLISTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "assignment_status" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "maintenance_priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "maintenance_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "lease_status" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');

-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "floors" INTEGER,
    "status" "building_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "building_id" UUID NOT NULL,
    "room_number" TEXT NOT NULL,
    "floor" INTEGER,
    "room_type" "room_type" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "room_status" NOT NULL DEFAULT 'AVAILABLE',
    "amenities" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "colleague_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "phone" TEXT,
    "enrollment_status" TEXT,
    "last_synced_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housing_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "term" TEXT NOT NULL,
    "status" "application_status" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "housing_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roommate_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "preferred_student_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "roommate_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "application_id" UUID,
    "term" TEXT NOT NULL,
    "status" "assignment_status" NOT NULL DEFAULT 'PENDING',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "room_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_id" UUID NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "maintenance_priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "maintenance_status" NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "sharepoint_url" TEXT,
    "status" "lease_status" NOT NULL DEFAULT 'DRAFT',
    "signed_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_charges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "charge_code" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "term" TEXT NOT NULL,
    "exported_at" TIMESTAMPTZ(6),
    "export_batch_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "billing_charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "action" "audit_action" NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buildings_code_key" ON "buildings"("code");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_building_id_room_number_key" ON "rooms"("building_id", "room_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_colleague_id_key" ON "students"("colleague_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "housing_applications_student_id_term_key" ON "housing_applications"("student_id", "term");

-- CreateIndex
CREATE UNIQUE INDEX "room_assignments_application_id_key" ON "room_assignments"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "leases_assignment_id_key" ON "leases"("assignment_id");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "housing_applications" ADD CONSTRAINT "housing_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roommate_preferences" ADD CONSTRAINT "roommate_preferences_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "housing_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_assignments" ADD CONSTRAINT "room_assignments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "housing_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "room_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_charges" ADD CONSTRAINT "billing_charges_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_charges" ADD CONSTRAINT "billing_charges_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "room_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
