/*
  Warnings:

  - You are about to drop the column `adjuvante` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `doseVol` on the `Produto` table. All the data in the column will be lost.
  - You are about to drop the column `oleo` on the `Produto` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manejoId" TEXT NOT NULL,
    "numTrat" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "ingrediente" TEXT NOT NULL,
    "doseHa" TEXT NOT NULL,
    CONSTRAINT "Produto_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Produto" ("doseHa", "id", "ingrediente", "manejoId", "nome", "numTrat") SELECT "doseHa", "id", "ingrediente", "manejoId", "nome", "numTrat" FROM "Produto";
DROP TABLE "Produto";
ALTER TABLE "new_Produto" RENAME TO "Produto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
