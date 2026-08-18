import "server-only";

type EmailManejoPendente = {
  clienteNome: string;
  clienteEmail: string;
  eventoNome: string;
  manejoTitulo: string;
  manejoUrl: string;
};

export async function enviarEmailManejoPendente(dados: EmailManejoPendente) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[e-mail stub] Avisaria "${dados.clienteEmail}" (${dados.clienteNome}) que o manejo de ${dados.manejoTitulo} do evento "${dados.eventoNome}" está aguardando aprovação: ${dados.manejoUrl}. Defina RESEND_API_KEY no .env para ativar o envio real.`
    );
    return;
  }

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Arvo <notificacoes@arvo.com.br>",
      to: dados.clienteEmail,
      subject: `Novo manejo aguardando aprovação — ${dados.eventoNome}`,
      html: `
        <p>Olá, ${dados.clienteNome}.</p>
        <p>O manejo de <strong>${dados.manejoTitulo}</strong> do evento <strong>${dados.eventoNome}</strong> está pronto para sua avaliação.</p>
        <p><a href="${dados.manejoUrl}">Aprovar ou reprovar agora</a></p>
        <p>— Arvo, Caderno de Campo Digital</p>
      `,
    }),
  });

  if (!resposta.ok) {
    console.error("Falha ao enviar e-mail:", await resposta.text());
  }
}
