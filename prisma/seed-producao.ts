// Seed de PRODUÇÃO — cria só o usuário admin, sem clientes/eventos de
// demonstração. Roda uma única vez, direto contra o banco de produção,
// depois que a migração (`prisma migrate deploy`) já tiver sido aplicada.
//
// Uso: npx tsx prisma/seed-producao.ts
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const EMAIL_ADMIN = process.env.SEED_ADMIN_EMAIL ?? "admin@arvo.com.br";

function gerarSenhaForte() {
  return randomBytes(9).toString("base64url");
}

async function main() {
  const jaExiste = await prisma.usuario.findUnique({
    where: { email: EMAIL_ADMIN },
  });
  if (jaExiste) {
    console.log(
      `Já existe um usuário com o e-mail "${EMAIL_ADMIN}". Nada foi criado — se você quiser trocar a senha, isso precisa ser feito por outro caminho (esse script só cria o primeiro admin).`
    );
    return;
  }

  const senha = gerarSenhaForte();
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.usuario.create({
    data: {
      nome: "Admin Arvo",
      email: EMAIL_ADMIN,
      senha: senhaHash,
      role: "admin",
    },
  });

  console.log("Usuário admin criado com sucesso. Guarde essa senha agora — ela não vai aparecer de novo:");
  console.log(`  E-mail: ${EMAIL_ADMIN}`);
  console.log(`  Senha:  ${senha}`);
}

main()
  .catch((erro) => {
    console.error("Falha ao criar o admin de produção:", erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
