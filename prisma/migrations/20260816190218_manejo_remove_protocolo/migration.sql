/*
  Warnings:

  - You are about to drop the column `protocolo` on the `Manejo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Manejo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "responsavel" TEXT,
    "acompanhamento" TEXT,
    "data" DATETIME NOT NULL,
    "horaInicio" TEXT,
    "horaFim" TEXT,
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
INSERT INTO "new_Manejo" ("acompanhamento", "altBarra", "anotacoes", "createdAt", "data", "equipamento", "espLinhas", "espPontas", "eventoId", "horaFim", "horaInicio", "id", "numPontas", "ponta", "pressao", "profundidade", "qtdLinhas", "responsavel", "sementesPorMetro", "status", "tempFim", "tempInicio", "tipo", "tipoAplicacao", "ultimaChuva", "umidFim", "umidInicio", "updatedAt", "velocidade", "ventoFim", "ventoInicio", "volCalda", "volumePonta") SELECT "acompanhamento", "altBarra", "anotacoes", "createdAt", "data", "equipamento", "espLinhas", "espPontas", "eventoId", "horaFim", "horaInicio", "id", "numPontas", "ponta", "pressao", "profundidade", "qtdLinhas", "responsavel", "sementesPorMetro", "status", "tempFim", "tempInicio", "tipo", "tipoAplicacao", "ultimaChuva", "umidFim", "umidInicio", "updatedAt", "velocidade", "ventoFim", "ventoInicio", "volCalda", "volumePonta" FROM "Manejo";
DROP TABLE "Manejo";
ALTER TABLE "new_Manejo" RENAME TO "Manejo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
