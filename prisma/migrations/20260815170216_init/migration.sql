-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parcela" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "linhas" INTEGER,
    "largura" TEXT,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    CONSTRAINT "Parcela_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Manejo" (
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

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manejoId" TEXT NOT NULL,
    "numTrat" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "ingrediente" TEXT NOT NULL,
    "doseHa" TEXT NOT NULL,
    "doseVol" TEXT NOT NULL,
    "oleo" TEXT,
    "adjuvante" TEXT,
    CONSTRAINT "Produto_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manejoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Foto_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoAprovacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manejoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoAprovacao_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HistoricoAprovacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manejoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comentario_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "clienteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
