/*
  Warnings:

  - You are about to drop the column `eliminado` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the column `coordenadas` on the `Stand` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Producto" DROP COLUMN "eliminado";

-- AlterTable
ALTER TABLE "Stand" DROP COLUMN "coordenadas";
