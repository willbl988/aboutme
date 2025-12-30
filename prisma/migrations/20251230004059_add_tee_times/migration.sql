-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "slope" INTEGER;

-- AlterTable
ALTER TABLE "Hole" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "MessageGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeeTime" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "players" INTEGER NOT NULL DEFAULT 4,
    "price" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeeTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeeTimeBooking" (
    "id" TEXT NOT NULL,
    "teeTimeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "players" INTEGER NOT NULL DEFAULT 1,
    "playerNames" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeeTimeBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WagerPayment" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "fromPlayer" TEXT NOT NULL,
    "toPlayer" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "paidBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WagerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageGroup_createdById_idx" ON "MessageGroup"("createdById");

-- CreateIndex
CREATE INDEX "MessageGroupMember_groupId_idx" ON "MessageGroupMember"("groupId");

-- CreateIndex
CREATE INDEX "MessageGroupMember_userId_idx" ON "MessageGroupMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageGroupMember_groupId_userId_key" ON "MessageGroupMember"("groupId", "userId");

-- CreateIndex
CREATE INDEX "Message_groupId_createdAt_idx" ON "Message"("groupId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

-- CreateIndex
CREATE INDEX "MessageRead_messageId_idx" ON "MessageRead"("messageId");

-- CreateIndex
CREATE INDEX "MessageRead_userId_idx" ON "MessageRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_userId_key" ON "MessageRead"("messageId", "userId");

-- CreateIndex
CREATE INDEX "TeeTime_courseId_date_idx" ON "TeeTime"("courseId", "date");

-- CreateIndex
CREATE INDEX "TeeTime_date_status_idx" ON "TeeTime"("date", "status");

-- CreateIndex
CREATE INDEX "TeeTime_status_idx" ON "TeeTime"("status");

-- CreateIndex
CREATE INDEX "TeeTimeBooking_teeTimeId_idx" ON "TeeTimeBooking"("teeTimeId");

-- CreateIndex
CREATE INDEX "TeeTimeBooking_userId_idx" ON "TeeTimeBooking"("userId");

-- CreateIndex
CREATE INDEX "TeeTimeBooking_status_idx" ON "TeeTimeBooking"("status");

-- CreateIndex
CREATE INDEX "WagerPayment_roundId_idx" ON "WagerPayment"("roundId");

-- CreateIndex
CREATE INDEX "WagerPayment_fromPlayer_idx" ON "WagerPayment"("fromPlayer");

-- CreateIndex
CREATE INDEX "WagerPayment_toPlayer_idx" ON "WagerPayment"("toPlayer");

-- CreateIndex
CREATE INDEX "WagerPayment_status_idx" ON "WagerPayment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WagerPayment_roundId_fromPlayer_toPlayer_amount_key" ON "WagerPayment"("roundId", "fromPlayer", "toPlayer", "amount");

-- AddForeignKey
ALTER TABLE "MessageGroup" ADD CONSTRAINT "MessageGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageGroupMember" ADD CONSTRAINT "MessageGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MessageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageGroupMember" ADD CONSTRAINT "MessageGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MessageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTime" ADD CONSTRAINT "TeeTime_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTimeBooking" ADD CONSTRAINT "TeeTimeBooking_teeTimeId_fkey" FOREIGN KEY ("teeTimeId") REFERENCES "TeeTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeeTimeBooking" ADD CONSTRAINT "TeeTimeBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WagerPayment" ADD CONSTRAINT "WagerPayment_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
