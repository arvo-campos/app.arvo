-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "local" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcela" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "linhas" INTEGER,
    "largura" TEXT,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "Parcela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manejo" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "responsavel" TEXT,
    "acompanhamento" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT,
    "horaFim" TEXT,
    "tempInicio" DOUBLE PRECISION,
    "tempFim" DOUBLE PRECISION,
    "umidInicio" DOUBLE PRECISION,
    "umidFim" DOUBLE PRECISION,
    "ventoInicio" DOUBLE PRECISION,
    "ventoFim" DOUBLE PRECISION,
    "ultimaChuva" TEXT,
    "equipamento" TEXT,
    "qtdLinhas" INTEGER,
    "espLinhas" DOUBLE PRECISION,
    "profundidade" DOUBLE PRECISION,
    "sementesPorMetro" TEXT,
    "tipoAplicacao" TEXT,
    "ponta" TEXT,
    "volumePonta" TEXT,
    "numPontas" INTEGER,
    "espPontas" DOUBLE PRECISION,
    "altBarra" DOUBLE PRECISION,
    "pressao" DOUBLE PRECISION,
    "volCalda" DOUBLE PRECISION,
    "velocidade" DOUBLE PRECISION,
    "anotacoes" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manejo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "manejoId" TEXT NOT NULL,
    "numTrat" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "ingrediente" TEXT NOT NULL,
    "doseHa" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "manejoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoAprovacao" (
    "id" TEXT NOT NULL,
    "manejoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoAprovacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comentario" (
    "id" TEXT NOT NULL,
    "manejoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comentario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "clienteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vistoria" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "condicoes" TEXT,
    "observacoes" TEXT,
    "solicitaIntervencao" BOOLEAN NOT NULL DEFAULT false,
    "intervencaoDescricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoVistoria" (
    "id" TEXT NOT NULL,
    "vistoriaId" TEXT NOT NULL,
    "parcelaId" TEXT,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoVistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ManejoToParcela" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ManejoToParcela_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "_ManejoToParcela_B_index" ON "_ManejoToParcela"("B");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcela" ADD CONSTRAINT "Parcela_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manejo" ADD CONSTRAINT "Manejo_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAprovacao" ADD CONSTRAINT "HistoricoAprovacao_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoAprovacao" ADD CONSTRAINT "HistoricoAprovacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_manejoId_fkey" FOREIGN KEY ("manejoId") REFERENCES "Manejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comentario" ADD CONSTRAINT "Comentario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoVistoria" ADD CONSTRAINT "FotoVistoria_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoVistoria" ADD CONSTRAINT "FotoVistoria_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Parcela"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManejoToParcela" ADD CONSTRAINT "_ManejoToParcela_A_fkey" FOREIGN KEY ("A") REFERENCES "Manejo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManejoToParcela" ADD CONSTRAINT "_ManejoToParcela_B_fkey" FOREIGN KEY ("B") REFERENCES "Parcela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

