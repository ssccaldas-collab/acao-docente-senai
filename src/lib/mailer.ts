import nodemailer from 'nodemailer';

const STAGE_LABELS: Record<number, string> = {
  1: 'Documentação',
  2: 'Observação de Aula',
  3: 'Devolutiva',
  4: 'Réplica',
};

const APP_URL = (process.env.APP_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');

const ACCENTS = {
  indigo: { bg: '#EDEBFC', color: '#4338CA', button: '#4338CA' },
  amber: { bg: '#FBEDDD', color: '#B4590E', button: '#B4590E' },
  red: { bg: '#FDEAEA', color: '#C62828', button: '#C62828' },
} as const;

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

async function sendMail(to: string, subject: string, html: string) {
  const transport = getTransport();
  if (!transport) {
    console.log(`[mailer] SMTP não configurado — pulando envio para ${to}: "${subject}"`);
    return;
  }
  try {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@senai.br';
    await transport.sendMail({ from: `Ação Docente SENAI <${fromAddress}>`, to, subject, html });
  } catch (err) {
    console.error('[mailer] Falha ao enviar e-mail:', err);
  }
}

// Monta o e-mail com o mesmo visual de marca (cabeçalho índigo, selo colorido por tipo de aviso,
// botão de CTA) usando tabelas + estilo inline — a única forma de ter aparência consistente em
// clientes de e-mail como Outlook, que ignoram a maior parte do CSS moderno.
function wrapEmail(opts: {
  emoji: string;
  kicker: string;
  accent: keyof typeof ACCENTS;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
}) {
  const { emoji, kicker, accent, title, bodyHtml, ctaLabel } = opts;
  const { bg, color, button } = ACCENTS[accent];
  const font = "Arial, Helvetica, sans-serif";

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F2FA;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E1E2F1;">
        <tr>
          <td style="background:#4338CA;padding:22px 28px;">
            <span style="font-size:20px;vertical-align:middle;">🎓</span>
            <span style="font-size:15px;font-weight:700;color:#FFFFFF;font-family:${font};letter-spacing:0.02em;vertical-align:middle;"> AÇÃO DOCENTE</span>
            <div style="font-size:11px;color:#D9D6FA;font-family:${font};margin-top:2px;">SENAI · Sistema de Avaliação Docente</div>
          </td>
        </tr>
        <tr>
          <td style="padding:30px 28px 26px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <tr>
                <td style="background:${bg};border-radius:999px;padding:5px 12px;">
                  <span style="font-family:${font};font-size:12px;font-weight:700;color:${color};letter-spacing:0.02em;">${emoji} ${kicker}</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 14px;font-family:${font};font-size:18px;line-height:1.4;color:#201C4D;">${title}</h1>
            <div style="font-family:${font};font-size:14px;line-height:1.65;color:#3A3960;">${bodyHtml}</div>
            ${ctaLabel ? `
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;">
              <tr>
                <td style="background:${button};border-radius:8px;">
                  <a href="${APP_URL}" style="display:inline-block;padding:11px 22px;font-family:${font};font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">${ctaLabel} →</a>
                </td>
              </tr>
            </table>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;border-top:1px solid #EEEEF6;">
            <p style="margin:0;font-family:${font};font-size:11px;color:#9A9CBC;line-height:1.5;">Este é um e-mail automático do Sistema de Ação Docente — não é necessário responder.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

export async function sendCycleStartedEmail(to: string, teacherName: string, deadline: string | null) {
  const deadlineText = deadline
    ? `O prazo para envio da documentação é <b>${deadline}</b>.`
    : 'Fique atento ao prazo de envio da documentação, que será informado pelo seu gestor.';
  await sendMail(
    to,
    '🎓 Ação Docente — processo iniciado',
    wrapEmail({
      emoji: '🎓', kicker: 'NOVO CICLO', accent: 'indigo',
      title: 'Sua Ação Docente foi iniciada',
      bodyHtml: `<p style="margin:0 0 12px;">Olá, ${teacherName}.</p><p style="margin:0;">Sua Ação Docente deste semestre foi iniciada. ${deadlineText} Acesse o sistema para enviar seus arquivos da Etapa 1 (Documentação).</p>`,
      ctaLabel: 'Acessar o sistema',
    })
  );
}

export async function sendDeadlineReminderEmail(to: string, teacherName: string, deadline: string, daysLeft: number) {
  const urgency = daysLeft === 0 ? 'vence <b>hoje</b>' : daysLeft === 1 ? 'vence <b>amanhã</b>' : `vence em <b>${daysLeft} dias</b> (${deadline})`;
  const isToday = daysLeft === 0;
  await sendMail(
    to,
    isToday ? '⏰ Ação Docente — prazo de documentação vence hoje' : '📅 Ação Docente — prazo de documentação se aproximando',
    wrapEmail({
      emoji: isToday ? '⏰' : '📅', kicker: isToday ? 'PRAZO URGENTE' : 'LEMBRETE DE PRAZO', accent: 'amber',
      title: isToday ? 'Seu prazo de documentação vence hoje' : 'Seu prazo de documentação está se aproximando',
      bodyHtml: `<p style="margin:0 0 12px;">Olá, ${teacherName}.</p><p style="margin:0;">O prazo para envio da sua documentação da Ação Docente ${urgency}. Acesse o sistema para enviar seus arquivos.</p>`,
      ctaLabel: 'Enviar documentação',
    })
  );
}

export async function sendTeacherOverdueEmail(to: string, teacherName: string) {
  await sendMail(
    to,
    '⚠️ Ação Docente — prazo de documentação vencido',
    wrapEmail({
      emoji: '⚠️', kicker: 'PRAZO VENCIDO', accent: 'red',
      title: 'O prazo da sua documentação venceu',
      bodyHtml: `<p style="margin:0 0 12px;">Olá, ${teacherName}.</p><p style="margin:0;">O prazo para envio da sua documentação da Ação Docente <b>venceu</b>. Acesse o sistema o quanto antes para enviar seus arquivos e regularizar sua situação.</p>`,
      ctaLabel: 'Regularizar agora',
    })
  );
}

export async function sendOverdueEmail(to: string, teacherName: string, stage: number) {
  await sendMail(
    to,
    '🚨 Ação Docente — etapa em atraso',
    wrapEmail({
      emoji: '🚨', kicker: 'ETAPA ATRASADA', accent: 'red',
      title: 'Um ciclo sob sua gestão está atrasado',
      bodyHtml: `<p style="margin:0;">O ciclo de avaliação do docente <b>${teacherName}</b> está atrasado na etapa <b>${STAGE_LABELS[stage] ?? stage}</b>. Acesse o sistema para verificar.</p>`,
      ctaLabel: 'Verificar ciclo',
    })
  );
}

export async function sendDocumentUploadedEmail(to: string, teacherName: string, fileName: string) {
  await sendMail(
    to,
    '📄 Ação Docente — documentação recebida',
    wrapEmail({
      emoji: '📄', kicker: 'DOCUMENTO RECEBIDO', accent: 'indigo',
      title: 'Novo documento enviado por um docente',
      bodyHtml: `<p style="margin:0;">O docente <b>${teacherName}</b> enviou um documento (${fileName}) para a Etapa 1 (Documentação) da Ação Docente. Acesse o sistema para avaliar e decidir se avança para a próxima etapa.</p>`,
      ctaLabel: 'Avaliar documentação',
    })
  );
}

export async function sendFeedbackRegisteredEmail(to: string, teacherName: string) {
  await sendMail(
    to,
    '💬 Ação Docente — devolutiva registrada',
    wrapEmail({
      emoji: '💬', kicker: 'DEVOLUTIVA REGISTRADA', accent: 'indigo',
      title: 'Sua devolutiva foi registrada',
      bodyHtml: `<p style="margin:0 0 12px;">Olá, ${teacherName}.</p><p style="margin:0;">Sua devolutiva da Ação Docente foi registrada pelo gestor. Acesse o sistema para visualizar os apontamentos e confirmar ciência.</p>`,
      ctaLabel: 'Ver devolutiva',
    })
  );
}
