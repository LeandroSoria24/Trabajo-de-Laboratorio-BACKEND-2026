/*
  Warnings:

  - You are about to drop the column `localidad` on the `Artesano` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion` on the `Stand` table. All the data in the column will be lost.
  - The `estado` column on the `Stand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[usuarioId]` on the table `Artesano` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `localidadId` to the `Artesano` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pabellon` to the `Stand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sector` to the `Stand` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'ARTESANO', 'VISITANTE');

-- CreateEnum
CREATE TYPE "EstadoStand" AS ENUM ('DISPONIBLE', 'OCUPADO');

-- AlterEnum
ALTER TYPE "EstadoSolicitud" ADD VALUE 'MODIFICACION_SOLICITADA';

-- DropForeignKey
ALTER TABLE "Stand" DROP CONSTRAINT "Stand_artesanoId_fkey";

-- AlterTable
ALTER TABLE "Artesano" DROP COLUMN "localidad",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "localidadId" INTEGER NOT NULL,
ADD COLUMN     "usuarioId" INTEGER;

-- AlterTable
ALTER TABLE "Stand" DROP COLUMN "ubicacion",
ADD COLUMN     "coordenadas" TEXT,
ADD COLUMN     "pabellon" TEXT NOT NULL,
ADD COLUMN     "sector" TEXT NOT NULL,
ALTER COLUMN "numero" DROP NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoStand" NOT NULL DEFAULT 'DISPONIBLE',
ALTER COLUMN "artesanoId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'VISITANTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provincia" TEXT NOT NULL DEFAULT 'Catamarca',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudPostulacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "datos_personales" TEXT NOT NULL,
    "datos_emprendimiento" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudPostulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroConsulta" (
    "id" SERIAL NOT NULL,
    "visitanteId" INTEGER,
    "termino_busqueda" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroConsulta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Localidad_nombre_key" ON "Localidad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Artesano_usuarioId_key" ON "Artesano"("usuarioId");

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_localidadId_fkey" FOREIGN KEY ("localidadId") REFERENCES "Localidad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stand" ADD CONSTRAINT "Stand_artesanoId_fkey" FOREIGN KEY ("artesanoId") REFERENCES "Artesano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPostulacion" ADD CONSTRAINT "SolicitudPostulacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroConsulta" ADD CONSTRAINT "RegistroConsulta_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
