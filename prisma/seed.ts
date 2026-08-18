import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const SENHA_ADMIN = "arvo123";
const SENHA_CLIENTE = "cliente123";

function daquiA(dias: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d;
}

const CLIENTES = [
  { nome: "Golden Harvest", slug: "goldenharvest", responsavel: "Marcos Vinícius" },
  { nome: "NK Sementes", slug: "nk", responsavel: "Fernanda Lopes" },
  { nome: "GDM", slug: "gdm", responsavel: "Ricardo Alves" },
  { nome: "Brasmax", slug: "brasmax", responsavel: "Juliana Prado" },
  { nome: "Don Mario", slug: "donmario", responsavel: "Eduardo Nogueira" },
  { nome: "Nidera", slug: "nidera", responsavel: "Camila Souza" },
];

async function limparBanco() {
  await prisma.fotoVistoria.deleteMany();
  await prisma.vistoria.deleteMany();
  await prisma.comentario.deleteMany();
  await prisma.historicoAprovacao.deleteMany();
  await prisma.foto.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.manejo.deleteMany();
  await prisma.parcela.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.cliente.deleteMany();
}

async function main() {
  await limparBanco();

  const senhaAdminHash = await bcrypt.hash(SENHA_ADMIN, 10);
  const senhaClienteHash = await bcrypt.hash(SENHA_CLIENTE, 10);

  const admin = await prisma.usuario.create({
    data: {
      nome: "Admin Arvo",
      email: "admin@arvo.com.br",
      senha: senhaAdminHash,
      role: "admin",
    },
  });

  const clientes = [];
  for (const c of CLIENTES) {
    const cliente = await prisma.cliente.create({
      data: {
        nome: c.nome,
        responsavel: c.responsavel,
        email: `contato@${c.slug}.com.br`,
        telefone: "(45) 99999-0000",
        usuarios: {
          create: {
            nome: c.responsavel,
            email: `contato@${c.slug}.com.br`,
            senha: senhaClienteHash,
            role: "cliente",
          },
        },
      },
      include: { usuarios: true },
    });
    clientes.push(cliente);
  }

  const goldenHarvest = clientes[0];
  const nk = clientes[1];
  const gdm = clientes[2];

  // Evento 1 — em andamento, com croqui de parcelas
  const eventoShowRural = await prisma.evento.create({
    data: {
      nome: "Show Rural Coopavel 2026",
      clienteId: goldenHarvest.id,
      local: "Cascavel - PR",
      latitude: "-24.9578",
      longitude: "-53.4595",
      dataInicio: daquiA(31),
      dataFim: daquiA(35),
      status: "em_andamento",
    },
  });

  const tiposLinha = ["parcela", "parcela", "parcela", "corredor"];
  let numParcela = 1;
  for (let linha = 0; linha < 5; linha++) {
    const tipo = tiposLinha[linha % tiposLinha.length];
    for (let coluna = 0; coluna < 5; coluna++) {
      await prisma.parcela.create({
        data: {
          eventoId: eventoShowRural.id,
          nome: tipo === "parcela" ? `GH ${2450 + numParcela}` : `Corredor ${linha + 1}`,
          linhas: tipo === "parcela" ? 6 : null,
          largura: tipo === "parcela" ? "4.5m" : "2m",
          posX: coluna,
          posY: linha,
          tipo,
        },
      });
      if (tipo === "parcela") numParcela++;
    }
  }

  // Evento 2 — em andamento
  const eventoNK = await prisma.evento.create({
    data: {
      nome: "Dia de Campo NK Sementes 2026",
      clienteId: nk.id,
      local: "Não-Me-Toque - RS",
      latitude: "-28.4611",
      longitude: "-52.8194",
      dataInicio: daquiA(13),
      dataFim: daquiA(15),
      status: "em_andamento",
    },
  });

  // Evento 3 — concluído
  const eventoGDM = await prisma.evento.create({
    data: {
      nome: "Dia de Campo GDM Safra 25/26",
      clienteId: gdm.id,
      local: "Rio Verde - GO",
      latitude: "-17.7975",
      longitude: "-50.9269",
      dataInicio: daquiA(-14),
      dataFim: daquiA(-12),
      status: "concluido",
    },
  });

  const climaBase = {
    tempInicio: 24.5,
    tempFim: 27.1,
    umidInicio: 68,
    umidFim: 55,
    ventoInicio: 4.2,
    ventoFim: 6.1,
    ultimaChuva: "2 dias atrás",
  };

  async function criarManejoPlantio(
    eventoId: string,
    status: string
  ) {
    return prisma.manejo.create({
      data: {
        eventoId,
        tipo: "plantio",
        responsavel: "Equipe de Campo Arvo",
        acompanhamento: "João Schiebel",
        data: new Date(),
        horaInicio: "07:30",
        horaFim: "09:15",
        ...climaBase,
        equipamento: "Semeadora Pneumática 9 linhas",
        qtdLinhas: 9,
        espLinhas: 0.45,
        profundidade: 4.5,
        sementesPorMetro: "12-14",
        anotacoes: "Solo em boas condições de umidade para plantio.",
        status,
      },
    });
  }

  async function criarManejoAplicacao(
    eventoId: string,
    status: string
  ) {
    const manejo = await prisma.manejo.create({
      data: {
        eventoId,
        tipo: "aplicacao",
        responsavel: "Equipe de Campo Arvo",
        acompanhamento: "João Schiebel",
        data: new Date(),
        horaInicio: "14:00",
        horaFim: "15:30",
        ...climaBase,
        tipoAplicacao: "Herbicida em pós-emergência",
        ponta: "Leque 110",
        volumePonta: "02",
        numPontas: 24,
        espPontas: 0.5,
        altBarra: 0.5,
        pressao: 2.8,
        volCalda: 120,
        velocidade: 7.5,
        anotacoes: "Aplicação realizada sem vento excessivo.",
        status,
      },
    });

    await prisma.produto.createMany({
      data: [
        {
          manejoId: manejo.id,
          numTrat: 1,
          nome: "Produto Demonstrativo A",
          ingrediente: "Glifosato",
          doseHa: "2,5 L/ha",
        },
        {
          manejoId: manejo.id,
          numTrat: 2,
          nome: "Óleo mineral",
          ingrediente: "Óleo mineral",
          doseHa: "0,5 L/ha",
        },
        {
          manejoId: manejo.id,
          numTrat: 3,
          nome: "Espalhante adesivo",
          ingrediente: "Espalhante adesivo",
          doseHa: "0,1 L/ha",
        },
      ],
    });

    return manejo;
  }

  // Show Rural (Golden Harvest): cobre os 4 status
  const m1 = await criarManejoPlantio(eventoShowRural.id, "pendente");
  const m2 = await criarManejoAplicacao(eventoShowRural.id, "aprovado");
  const m3 = await criarManejoPlantio(eventoShowRural.id, "reprovado");
  const m4 = await criarManejoAplicacao(eventoShowRural.id, "concluido");

  const usuarioGoldenHarvest = goldenHarvest.usuarios[0];

  await prisma.historicoAprovacao.create({
    data: {
      manejoId: m2.id,
      usuarioId: usuarioGoldenHarvest.id,
      acao: "aprovado",
      observacao: "Tudo conforme protocolo.",
    },
  });

  await prisma.historicoAprovacao.create({
    data: {
      manejoId: m3.id,
      usuarioId: usuarioGoldenHarvest.id,
      acao: "reprovado",
      observacao: "Profundidade de plantio abaixo do combinado — retrabalho necessário.",
    },
  });

  await prisma.comentario.create({
    data: {
      manejoId: m3.id,
      usuarioId: usuarioGoldenHarvest.id,
      texto: "Podem já agendar o retrabalho para essa parcela?",
    },
  });

  await prisma.historicoAprovacao.create({
    data: {
      manejoId: m4.id,
      usuarioId: usuarioGoldenHarvest.id,
      acao: "aprovado",
      observacao: null,
    },
  });

  // NK: 1 pendente, 1 aprovado
  await criarManejoAplicacao(eventoNK.id, "pendente");
  const nkAprovado = await criarManejoPlantio(eventoNK.id, "aprovado");
  await prisma.historicoAprovacao.create({
    data: {
      manejoId: nkAprovado.id,
      usuarioId: nk.usuarios[0].id,
      acao: "aprovado",
      observacao: "Aprovado sem ressalvas.",
    },
  });

  // GDM (evento concluído): tudo concluído
  await criarManejoPlantio(eventoGDM.id, "concluido");
  await criarManejoAplicacao(eventoGDM.id, "concluido");

  // Vistorias de demonstração
  await prisma.vistoria.create({
    data: {
      eventoId: eventoShowRural.id,
      autorId: admin.id,
      data: new Date(),
      condicoes:
        "Estande uniforme nas parcelas centrais, leve amarelecimento na bordadura leste.",
      observacoes: "Vistoria semanal de rotina. Sem pragas ou doenças aparentes.",
      solicitaIntervencao: false,
    },
  });
  await prisma.vistoria.create({
    data: {
      eventoId: eventoShowRural.id,
      autorId: usuarioGoldenHarvest.id,
      data: new Date(),
      observacoes: "Notamos falhas de estande na parcela GH 2465, próxima ao corredor.",
      solicitaIntervencao: true,
      intervencaoDescricao:
        "Avaliar necessidade de replantio pontual na GH 2465 antes da visita do cliente final.",
    },
  });
  await prisma.vistoria.create({
    data: {
      eventoId: eventoNK.id,
      autorId: admin.id,
      data: new Date(),
      condicoes: "Campo em bom estado geral, irrigação funcionando normalmente.",
      solicitaIntervencao: false,
    },
  });

  console.log("Banco populado com dados de demonstração:");
  console.log("  Admin: admin@arvo.com.br / " + SENHA_ADMIN);
  for (const c of CLIENTES) {
    console.log(`  ${c.nome}: contato@${c.slug}.com.br / ${SENHA_CLIENTE}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
