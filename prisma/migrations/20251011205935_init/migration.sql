-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AllowedEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL DEFAULT 25,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "allowedEmailId" TEXT NOT NULL,
    "timeSlotId" TEXT NOT NULL,
    "reservationDate" DATETIME NOT NULL,
    "cancellationCode" TEXT NOT NULL,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_allowedEmailId_fkey" FOREIGN KEY ("allowedEmailId") REFERENCES "AllowedEmail" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
