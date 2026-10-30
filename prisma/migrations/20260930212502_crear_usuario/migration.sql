/*
  Warnings:

  - The `usuarioId` column on the `Artesano` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `visitanteId` column on the `RegistroConsulta` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `usuarioId` column on the `SolicitudPostulacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `activo` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Artesano" DROP CONSTRAINT "Artesano_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroConsulta" DROP CONSTRAINT "RegistroConsulta_visitanteId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudPostulacion" DROP CONSTRAINT "SolicitudPostulacion_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Artesano" DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" UUID;

-- AlterTable
ALTER TABLE "RegistroConsulta" DROP COLUMN "visitanteId",
ADD COLUMN     "visitanteId" UUID;

-- AlterTable
ALTER TABLE "SolicitudPostulacion" DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" UUID;

-- Limpiar datos previos de Usuario (necesario para cambiar tipo de id y agregar columnas NOT NULL)
TRUNCATE TABLE "Usuario" CASCADE;

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "activo",
DROP COLUMN "password_hash",
DROP COLUMN "rol",
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Artesano_usuarioId_key" ON "Artesano"("usuarioId");

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPostulacion" ADD CONSTRAINT "SolicitudPostulacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroConsulta" ADD CONSTRAINT "RegistroConsulta_visitanteId_fkey" FOREIGN KEY ("visitanteId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
