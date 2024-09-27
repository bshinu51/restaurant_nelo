-- CreateTable
CREATE TABLE "diner" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "diner_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "dietary_restriction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "dietary_restriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diner_dietary_restriction" (
    "dinerId" TEXT NOT NULL,
    "restrictionId" INTEGER NOT NULL,

    CONSTRAINT "diner_dietary_restriction_pkey" PRIMARY KEY ("dinerId","restrictionId")
);

-- CreateTable
CREATE TABLE "restaurant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_endorsement" (
    "restaurantId" INTEGER NOT NULL,
    "restrictionId" INTEGER NOT NULL,

    CONSTRAINT "restaurant_endorsement_pkey" PRIMARY KEY ("restaurantId","restrictionId")
);

-- CreateTable
CREATE TABLE "table" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" SERIAL NOT NULL,
    "tableId" INTEGER NOT NULL,
    "reservationTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_diner" (
    "reservationId" INTEGER NOT NULL,
    "dinerId" TEXT NOT NULL,

    CONSTRAINT "reservation_diner_pkey" PRIMARY KEY ("reservationId","dinerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "dietary_restriction_name_key" ON "dietary_restriction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_tableId_reservationTime_key" ON "reservation"("tableId", "reservationTime");

-- AddForeignKey
ALTER TABLE "diner_dietary_restriction" ADD CONSTRAINT "diner_dietary_restriction_dinerId_fkey" FOREIGN KEY ("dinerId") REFERENCES "diner"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diner_dietary_restriction" ADD CONSTRAINT "diner_dietary_restriction_restrictionId_fkey" FOREIGN KEY ("restrictionId") REFERENCES "dietary_restriction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_endorsement" ADD CONSTRAINT "restaurant_endorsement_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_endorsement" ADD CONSTRAINT "restaurant_endorsement_restrictionId_fkey" FOREIGN KEY ("restrictionId") REFERENCES "dietary_restriction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table" ADD CONSTRAINT "table_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_diner" ADD CONSTRAINT "reservation_diner_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_diner" ADD CONSTRAINT "reservation_diner_dinerId_fkey" FOREIGN KEY ("dinerId") REFERENCES "diner"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
