-- CreateEnum
CREATE TYPE "TaskWorkType" AS ENUM ('GENERAL', 'BACKLOG', 'SPRINT');

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN "summary" TEXT,
ADD COLUMN "workType" "TaskWorkType" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN "sprintName" TEXT,
ADD COLUMN "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "referenceLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "richContent" TEXT,
ADD COLUMN "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "assignedToId" DROP NOT NULL;

-- Fix foreign key behavior for team-lead-owned tasks
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedToId_fkey";
ALTER TABLE "Task"
ADD CONSTRAINT "Task_assignedToId_fkey"
FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE INDEX "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

-- AddForeignKey
ALTER TABLE "TaskAssignment"
ADD CONSTRAINT "TaskAssignment_taskId_fkey"
FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment"
ADD CONSTRAINT "TaskAssignment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
