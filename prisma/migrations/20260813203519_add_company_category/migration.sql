-- CreateEnum
CREATE TYPE "CompanyCategory" AS ENUM ('SERVICIOS', 'RECARGAS');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "category" "CompanyCategory" NOT NULL DEFAULT 'SERVICIOS';
