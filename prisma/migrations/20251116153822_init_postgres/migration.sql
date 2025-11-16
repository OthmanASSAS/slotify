-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 25,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "allowedEmailId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "cancellationCode" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedEmail_email_key" ON "AllowedEmail"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_dayOfWeek_startTime_endTime_key" ON "TimeSlot"("dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_cancellationCode_key" ON "Reservation"("cancellationCode");

-- CreateIndex
CREATE INDEX "Reservation_reservationDate_idx" ON "Reservation"("reservationDate");

-- CreateIndex
CREATE INDEX "Reservation_cancellationCode_idx" ON "Reservation"("cancellationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_allowedEmailId_timeSlotId_reservationDate_key" ON "Reservation"("allowedEmailId", "timeSlotId", "reservationDate");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_allowedEmailId_fkey" FOREIGN KEY ("allowedEmailId") REFERENCES "AllowedEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
