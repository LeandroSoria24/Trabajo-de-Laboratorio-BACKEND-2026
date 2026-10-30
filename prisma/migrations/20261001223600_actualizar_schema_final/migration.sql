-- Limpiar la tabla de postulaciones previa para permitir la reestructuración de columnas obligatorias
TRUNCATE TABLE "SolicitudPostulacion" CASCADE;

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoSolicitud_new" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA');
ALTER TABLE "public"."SolicitudPostulacion" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "SolicitudPostulacion" ALTER COLUMN "estado" TYPE "EstadoSolicitud_new" USING ("estado"::text::"EstadoSolicitud_new");
ALTER TYPE "EstadoSolicitud" RENAME TO "EstadoSolicitud_old";
ALTER TYPE "EstadoSolicitud_new" RENAME TO "EstadoSolicitud";
DROP TYPE "public"."EstadoSolicitud_old";
ALTER TABLE "SolicitudPostulacion" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;

-- AlterEnum
ALTER TYPE "EstadoStand" ADD VALUE 'MANTENIMIENTO';

-- AlterEnum
ALTER TYPE "RolUsuario" ADD VALUE 'EVALUADOR';

-- DropForeignKey
ALTER TABLE "Artesano" DROP CONSTRAINT "Artesano_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroConsulta" DROP CONSTRAINT "RegistroConsulta_visitanteId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitudPostulacion" DROP CONSTRAINT "SolicitudPostulacion_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Artesano" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "usuarioId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "precio" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SolicitudPostulacion" DROP COLUMN "createdAt",
DROP COLUMN "datos_emprendimiento",
DROP COLUMN "datos_personales",
DROP COLUMN "usuarioId",
ADD COLUMN     "artesanoId" INTEGER NOT NULL,
ADD COLUMN     "evaluadorId" UUID,
ADD COLUMN     "fechaPresentacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "standId" INTEGER,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Crear pabellón y sector por defecto si hubiera stands
CREATE TABLE IF NOT EXISTS "Pabellon" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pabellon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Sector" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- Asegurar al menos un pabellón y sector para vincular stands existentes si los hubiera
INSERT INTO "Pabellon" ("id", "nombre") VALUES (1, 'Pabellón Central') ON CONFLICT DO NOTHING;
INSERT INTO "Sector" ("id", "nombre") VALUES (1, 'Sector General') ON CONFLICT DO NOTHING;

-- AlterTable Stand
ALTER TABLE "Stand" DROP COLUMN "pabellon",
DROP COLUMN "sector",
ADD COLUMN     "pabellonId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sectorId" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "Stand" ALTER COLUMN "pabellonId" DROP DEFAULT;
ALTER TABLE "Stand" ALTER COLUMN "sectorId" DROP DEFAULT;

-- AlterTable Usuario
ALTER TABLE "Usuario" ADD COLUMN     "rol" "RolUsuario" NOT NULL DEFAULT 'VISITANTE';

-- DropTable
DROP TABLE IF EXISTS "RegistroConsulta";

-- CreateIndex
CREATE UNIQUE INDEX "Pabellon_nombre_key" ON "Pabellon"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_nombre_key" ON "Sector"("nombre");

-- CreateIndex
CREATE INDEX "Producto_artesanoId_idx" ON "Producto"("artesanoId");

-- CreateIndex
CREATE INDEX "SolicitudPostulacion_artesanoId_idx" ON "SolicitudPostulacion"("artesanoId");

-- CreateIndex
CREATE INDEX "SolicitudPostulacion_standId_idx" ON "SolicitudPostulacion"("standId");

-- CreateIndex
CREATE INDEX "SolicitudPostulacion_evaluadorId_idx" ON "SolicitudPostulacion"("evaluadorId");

-- CreateIndex
CREATE INDEX "Stand_pabellonId_idx" ON "Stand"("pabellonId");

-- CreateIndex
CREATE INDEX "Stand_sectorId_idx" ON "Stand"("sectorId");

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stand" ADD CONSTRAINT "Stand_pabellonId_fkey" FOREIGN KEY ("pabellonId") REFERENCES "Pabellon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stand" ADD CONSTRAINT "Stand_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPostulacion" ADD CONSTRAINT "SolicitudPostulacion_artesanoId_fkey" FOREIGN KEY ("artesanoId") REFERENCES "Artesano"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPostulacion" ADD CONSTRAINT "SolicitudPostulacion_standId_fkey" FOREIGN KEY ("standId") REFERENCES "Stand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudPostulacion" ADD CONSTRAINT "SolicitudPostulacion_evaluadorId_fkey" FOREIGN KEY ("evaluadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
