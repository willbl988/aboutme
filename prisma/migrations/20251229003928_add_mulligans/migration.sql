-- AlterTable
ALTER TABLE "RoundPlayer" ADD COLUMN     "mulligansAllowed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Mulligan" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mulligan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Mulligan_roundId_playerId_idx" ON "Mulligan"("roundId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Mulligan_roundId_playerId_holeNumber_key" ON "Mulligan"("roundId", "playerId", "holeNumber");

-- AddForeignKey
ALTER TABLE "Mulligan" ADD CONSTRAINT "Mulligan_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mulligan" ADD CONSTRAINT "Mulligan_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "RoundPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
