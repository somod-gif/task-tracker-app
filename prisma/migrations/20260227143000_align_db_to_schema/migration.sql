-- CreateEnum
CREATE TYPE "SprintType" AS ENUM ('SPRINT', 'BACKLOG');

-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'SPRINT_ASSIGNED';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('PLATFORM_OWNER', 'SUPER_ADMIN', 'ADMIN', 'DEPARTMENT_LEAD', 'EMPLOYEE');
ALTER TABLE "User"
ALTER COLUMN "role"
TYPE "Role_new"
USING (
    CASE
        WHEN "role"::text = 'TEAM_LEAD' THEN 'DEPARTMENT_LEAD'
        ELSE "role"::text
    END::"Role_new"
);
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "sprintId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SprintType" NOT NULL DEFAULT 'SPRINT',
    "companyId" TEXT NOT NULL,
    "departmentId" TEXT,
    "assignedDepartmentId" TEXT,
    "createdById" TEXT NOT NULL,
    "assignedById" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sprint_companyId_idx" ON "Sprint"("companyId");

-- CreateIndex
CREATE INDEX "Sprint_departmentId_idx" ON "Sprint"("departmentId");

-- CreateIndex
CREATE INDEX "Sprint_assignedDepartmentId_idx" ON "Sprint"("assignedDepartmentId");

-- CreateIndex
CREATE INDEX "Sprint_createdById_idx" ON "Sprint"("createdById");

-- CreateIndex
CREATE INDEX "Task_sprintId_idx" ON "Task"("sprintId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_assignedDepartmentId_fkey" FOREIGN KEY ("assignedDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
