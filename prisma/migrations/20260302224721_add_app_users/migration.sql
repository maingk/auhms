-- CreateTable
CREATE TABLE "app_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "azure_oid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "app_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_users_azure_oid_key" ON "app_users"("azure_oid");

-- CreateIndex
CREATE UNIQUE INDEX "app_users_email_key" ON "app_users"("email");
