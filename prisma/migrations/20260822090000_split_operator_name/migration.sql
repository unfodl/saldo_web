-- AlterTable
ALTER TABLE "Operator" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '';

-- Backfill: put the old single "name" value into firstName so existing rows keep their data.
UPDATE "Operator" SET "firstName" = "name";

ALTER TABLE "Operator" DROP COLUMN "name";
