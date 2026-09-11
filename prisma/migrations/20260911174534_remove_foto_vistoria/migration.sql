/*
  Warnings:

  - You are about to drop the `FotoVistoria` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FotoVistoria" DROP CONSTRAINT "FotoVistoria_parcelaId_fkey";

-- DropForeignKey
ALTER TABLE "FotoVistoria" DROP CONSTRAINT "FotoVistoria_vistoriaId_fkey";

-- AlterTable
ALTER TABLE "Vistoria" ADD COLUMN     "estagioCultura" TEXT,
ADD COLUMN     "nivelDoencas" TEXT,
ADD COLUMN     "nivelEstresseHidrico" TEXT,
ADD COLUMN     "nivelPlantasDaninhas" TEXT,
ADD COLUMN     "nivelPragas" TEXT,
ADD COLUMN     "sugestaoDosagem" TEXT,
ADD COLUMN     "sugestaoProduto" TEXT;

-- DropTable
DROP TABLE "FotoVistoria";

-- CreateTable
CREATE TABLE "_ParcelaToVistoria" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ParcelaToVistoria_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ParcelaToVistoria_B_index" ON "_ParcelaToVistoria"("B");

-- AddForeignKey
ALTER TABLE "_ParcelaToVistoria" ADD CONSTRAINT "_ParcelaToVistoria_A_fkey" FOREIGN KEY ("A") REFERENCES "Parcela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParcelaToVistoria" ADD CONSTRAINT "_ParcelaToVistoria_B_fkey" FOREIGN KEY ("B") REFERENCES "Vistoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
