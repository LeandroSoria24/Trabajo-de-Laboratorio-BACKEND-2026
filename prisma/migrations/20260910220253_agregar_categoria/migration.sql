-- AlterTable
ALTER TABLE "Libro" ADD COLUMN     "categoriaID" INTEGER;

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- AddForeignKey
ALTER TABLE "Libro" ADD CONSTRAINT "Libro_categoriaID_fkey" FOREIGN KEY ("categoriaID") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
