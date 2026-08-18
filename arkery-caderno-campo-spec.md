# Arkery — Caderno de Campo Digital
> Especificação técnica para build via Claude Code

---

## Contexto

Aplicativo web para a **Arkery Eficiência em Agrotecnologias** substituir planilhas Excel + aprovações via WhatsApp pelo gerenciamento digital de manejos em eventos agro (Show Rural, Dias de Campo). Clientes reais: Golden Harvest, NK Sementes, GDM, Brasmax, Don Mario, Nidera.

---

## Stack sugerida

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express (ou Next.js full-stack)
- **Banco:** PostgreSQL (via Prisma ORM)
- **Auth:** JWT com dois perfis (admin / cliente)
- **Storage:** uploads de fotos via S3 ou local
- **PDF export:** Puppeteer ou react-pdf

---

## Modelos de dados

```prisma
model Cliente {
  id        String   @id @default(uuid())
  nome      String
  responsavel String
  email     String
  telefone  String?
  eventos   Evento[]
  usuarios  Usuario[]
}

model Evento {
  id        String   @id @default(uuid())
  nome      String
  clienteId String
  cliente   Cliente  @relation(fields: [clienteId], references: [id])
  local     String
  latitude  String?
  longitude String?
  dataInicio DateTime
  dataFim    DateTime?
  status    String   // "em_andamento" | "concluido"
  manejos   Manejo[]
  parcelas  Parcela[]
}

model Parcela {
  id       String  @id @default(uuid())
  eventoId String
  evento   Evento  @relation(fields: [eventoId], references: [id])
  nome     String  // ex: "GH 2459"
  linhas   Int?
  largura  String?
  posX     Int     // coluna no croqui
  posY     Int     // linha no croqui
  tipo     String  // "parcela" | "corredor" | "rua"
}

model Manejo {
  id             String   @id @default(uuid())
  eventoId       String
  evento         Evento   @relation(fields: [eventoId], references: [id])
  tipo           String   // "plantio" | "aplicacao"
  protocolo      String
  responsavel    String
  acompanhamento String?
  data           DateTime
  horaInicio     String
  horaFim        String
  latitude       String?
  longitude      String?

  // Clima
  tempInicio     Float?
  tempFim        Float?
  umidInicio     Float?
  umidFim        Float?
  ventoInicio    Float?
  ventoFim       Float?
  ultimaChuva    String?

  // Plantio (nullable)
  equipamento    String?
  qtdLinhas      Int?
  espLinhas      Float?
  profundidade   Float?
  sementesPorMetro String?

  // Aplicação (nullable)
  tipoAplicacao  String?
  ponta          String?
  volumePonta    String?
  numPontas      Int?
  espPontas      Float?
  altBarra       Float?
  pressao        Float?
  volCalda       Float?
  velocidade     Float?

  anotacoes      String?
  status         String   // "pendente" | "aprovado" | "reprovado" | "concluido"
  fotos          Foto[]
  produtos       Produto[]
  historico      HistoricoAprovacao[]
}

model Produto {
  id         String  @id @default(uuid())
  manejoId   String
  manejo     Manejo  @relation(fields: [manejoId], references: [id])
  numTrat    Int
  nome       String
  ingrediente String
  doseHa     String
  doseVol    String
  oleo       String?
  adjuvante  String?
}

model Foto {
  id       String @id @default(uuid())
  manejoId String
  manejo   Manejo @relation(fields: [manejoId], references: [id])
  url      String
  legenda  String?
}

model HistoricoAprovacao {
  id         String   @id @default(uuid())
  manejoId   String
  manejo     Manejo   @relation(fields: [manejoId], references: [id])
  usuarioId  String
  usuario    Usuario  @relation(fields: [usuarioId], references: [id])
  acao       String   // "aprovado" | "reprovado"
  observacao String?
  criadoEm  DateTime @default(now())
}

model Usuario {
  id        String  @id @default(uuid())
  nome      String
  email     String  @unique
  senha     String
  role      String  // "admin" | "cliente"
  clienteId String?
  cliente   Cliente? @relation(fields: [clienteId], references: [id])
  historico HistoricoAprovacao[]
}
```

---

## Rotas da API

### Auth
```
POST /api/auth/login          → { token, user }
POST /api/auth/logout
```

### Clientes (admin only)
```
GET    /api/clientes
POST   /api/clientes
PUT    /api/clientes/:id
DELETE /api/clientes/:id
```

### Eventos
```
GET  /api/eventos             → admin vê todos, cliente vê os seus
POST /api/eventos             → admin only
PUT  /api/eventos/:id
GET  /api/eventos/:id/croqui  → parcelas do evento
PUT  /api/eventos/:id/croqui  → admin atualiza croqui
```

### Manejos
```
GET    /api/manejos?eventoId=&status=&tipo=&clienteId=
POST   /api/manejos
PUT    /api/manejos/:id
GET    /api/manejos/:id
POST   /api/manejos/:id/aprovar    → { observacao? }
POST   /api/manejos/:id/reprovar   → { observacao }
GET    /api/manejos/:id/historico
POST   /api/manejos/:id/fotos      → multipart upload
GET    /api/manejos/:id/pdf        → stream PDF
```

### Dashboard
```
GET /api/dashboard             → contadores e resumo (admin)
GET /api/dashboard/cliente     → resumo do cliente logado
```

---

## Páginas / componentes principais

### Admin
| Rota | Descrição |
|---|---|
| `/dashboard` | Contadores, últimos manejos, gráfico por cliente, alertas de pendência |
| `/clientes` | Listagem + cadastro de clientes |
| `/eventos` | Listagem + cadastro de eventos |
| `/eventos/:id/croqui` | Grade visual editável das parcelas |
| `/manejos` | Listagem com filtros (cliente / evento / tipo / status / período) |
| `/manejos/novo` | Formulário dinâmico (campos mudam por tipo: plantio ou aplicação) |
| `/manejos/:id` | Detalhe completo + histórico de aprovações |

### Cliente
| Rota | Descrição |
|---|---|
| `/meus-eventos` | Cards dos eventos com badge de pendências |
| `/meus-eventos/:id` | Lista de manejos do evento com status |
| `/manejos/:id` | Caderno completo — visualização tipo laudo + botões aprovar/reprovar |

---

## Regras de negócio críticas

- Cliente só acessa dados do seu próprio `clienteId`
- Só manejos com `status = "pendente"` exibem botões de aprovação
- Reprovação exige `observacao` preenchida
- Aprovação/reprovação registra `HistoricoAprovacao` com `usuarioId`, `acao` e `criadoEm`
- Admin vê o histórico completo de todas as ações
- Upload de fotos aceita múltiplos arquivos; armazenar em `/uploads/manejos/:id/`
- PDF deve replicar o layout do Caderno de Campo original (cabeçalho Arkery, seções de clima, equipamento, protocolo de produtos, fotos)

---

## Melhorias para incluir no build

1. **Notificação por e-mail** ao cliente quando manejo vai para "pendente" (Nodemailer ou Resend)
2. **Comentários por manejo** — thread entre admin e cliente, substitui WhatsApp
3. **Status "Retrabalho solicitado"** — quando reprovado, aparece no dashboard admin como ação necessária
4. **Múltiplos usuários por cliente** — mais de um login com acesso ao mesmo `clienteId`
5. **Export PDF do evento** — relatório executivo com capa, resumo, fotos e taxa de aprovação
6. **Croqui clicável** — clicar numa parcela filtra os manejos realizados nela
7. **Responsivo mobile** — formulário de manejo usável em campo no celular

---

## Design

- Paleta: verde escuro `#27500A` / `#3B6D11` (primário), âmbar `#BA7517` (alertas/pendências), off-white `#F7F5F0` (fundo)
- Tipografia: título com fonte geométrica forte (ex: Syne), corpo com DM Sans ou similar
- Tom: profissional, técnico, agronegócio — sem gradientes excessivos
- Badge laranja em qualquer menu/card com manejos pendentes
- Formulário de manejo com seções colapsáveis (geral → clima → dados específicos → produtos → fotos)
