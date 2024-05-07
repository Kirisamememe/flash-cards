/*
  Warnings:

  - Added the required column `updated_at` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "synced_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "partOfSpeechId" TEXT,
ADD COLUMN     "synced_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT,
ALTER COLUMN "learned_at" DROP NOT NULL,
ALTER COLUMN "learned_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "PartOfSpeech" (
    "id" TEXT NOT NULL,
    "part_of_speech" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartOfSpeech" ADD CONSTRAINT "PartOfSpeech_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
