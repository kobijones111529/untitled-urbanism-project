-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "latitude" DECIMAL(6,4) NOT NULL,
    "longitude" DECIMAL(7,4) NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "valueField" TEXT NOT NULL,
    "areaField" TEXT NOT NULL,
    "areaPerAcre" DECIMAL(65,30) NOT NULL DEFAULT 1,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);
