-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVE', 'REJECT', 'DONE');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
