-- AlterEnum
ALTER TYPE "EstadoSolicitud" ADD VALUE 'CANCELADA';

-- DropForeignKey
ALTER TABLE "Artesano" DROP CONSTRAINT "Artesano_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Participante" DROP CONSTRAINT "Participante_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Artesano" ALTER COLUMN "activo" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "rol";

-- DropTable
DROP TABLE "Participante";

-- DropEnum
DROP TYPE "RolUsuario";

-- AddForeignKey
ALTER TABLE "Artesano" ADD CONSTRAINT "Artesano_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
