-- Drop existing Stand table if exists from previous db push
DROP TABLE IF EXISTS "Stand" CASCADE;
DROP TYPE IF EXISTS "EstadoSolicitud" CASCADE;

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "Stand" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "ubicacion" TEXT,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "artesanoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stand_codigo_key" ON "Stand"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Stand_artesanoId_key" ON "Stand"("artesanoId");

-- AddForeignKey
ALTER TABLE "Stand" ADD CONSTRAINT "Stand_artesanoId_fkey" FOREIGN KEY ("artesanoId") REFERENCES "Artesano"("id") ON DELETE CASCADE ON UPDATE CASCADE;
