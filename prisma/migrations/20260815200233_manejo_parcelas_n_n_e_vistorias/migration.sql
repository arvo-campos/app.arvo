/*
  Warnings:

  - You are about to drop the column `parcelaId` on the `Manejo` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Vistoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "condicoes" TEXT,
    "observacoes" TEXT,
    "solicitaIntervencao" BOOLEAN NOT NULL DEFAULT false,
    "intervencaoDescricao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vistoria_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vistoria_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FotoVistoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vistoriaId" TEXT NOT NULL,
    "parcelaId" TEXT,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FotoVistoria_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FotoVistoria_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Parcela" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ManejoToParcela" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ManejoToParcela_A_fkey" FOREIGN KEY ("A") REFERENCES "Manejo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ManejoToParcela_B_fkey" FOREIGN KEY ("B") REFERENCES "Parcela" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Manejo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "acompanhamento" TEXT,
    "data" DATETIME NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "tempInicio" REAL,
    "tempFim" REAL,
    "umidInicio" REAL,
    "umidFim" REAL,
    "ventoInicio" REAL,
    "ventoFim" REAL,
    "ultimaChuva" TEXT,
    "equipamento" TEXT,
    "qtdLinhas" INTEGER,
    "espLinhas" REAL,
    "profundidade" REAL,
    "sementesPorMetro" TEXT,
    "tipoAplicacao" TEXT,
    "ponta" TEXT,
    "volumePonta" TEXT,
    "numPontas" INTEGER,
    "espPontas" REAL,
    "altBarra" REAL,
    "pressao" REAL,
    "volCalda" REAL,
    "velocidade" REAL,
    "anotacoes" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Manejo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Manejo" ("acompanhamento", "altBarra", "anotacoes", "createdAt", "data", "equipamento", "espLinhas", "espPontas", "eventoId", "horaFim", "horaInicio", "id", "latitude", "longitude", "numPontas", "ponta", "pressao", "profundidade", "protocolo", "qtdLinhas", "responsavel", "sementesPorMetro", "status", "tempFim", "tempInicio", "tipo", "tipoAplicacao", "ultimaChuva", "umidFim", "umidInicio", "updatedAt", "velocidade", "ventoFim", "ventoInicio", "volCalda", "volumePonta") SELECT "acompanhamento", "altBarra", "anotacoes", "createdAt", "data", "equipamento", "espLinhas", "espPontas", "eventoId", "horaFim", "horaInicio", "id", "latitude", "longitude", "numPontas", "ponta", "pressao", "profundidade", "protocolo", "qtdLinhas", "responsavel", "sementesPorMetro", "status", "tempFim", "tempInicio", "tipo", "tipoAplicacao", "ultimaChuva", "umidFim", "umidInicio", "updatedAt", "velocidade", "ventoFim", "ventoInicio", "volCalda", "volumePonta" FROM "Manejo";
DROP TABLE "Manejo";
ALTER TABLE "new_Manejo" RENAME TO "Manejo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ManejoToParcela_AB_unique" ON "_ManejoToParcela"("A", "B");

-- CreateIndex
CREATE INDEX "_ManejoToParcela_B_index" ON "_ManejoToParcela"("B");
