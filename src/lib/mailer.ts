import nodemailer from 'nodemailer';

const STAGE_LABELS: Record<number, string> = {
  1: 'Documentação',
  2: 'Observação de Aula',
  3: 'Devolutiva',
  4: 'Réplica',
};

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
    await transport.sendMail({ from: process.env.SMTP_USER || 'no-reply@senai.br', to, subject, html });
  } catch (err) {
    console.error('[mailer] Falha ao enviar e-mail:', err);
  }
}

export async function sendDeadlineReminderEmail(to: string, teacherName: string, deadline: string) {
  await sendMail(
    to,
    'Ação Docente — prazo de documentação se aproximando',
    `<p>Olá, ${teacherName}.</p><p>O prazo para envio da sua documentação da Ação Docente vence em <b>${deadline}</b>. Acesse o sistema para enviar seus arquivos.</p>`
  );
}

export async function sendOverdueEmail(to: string, teacherName: string, stage: number) {
  await sendMail(
    to,
    'Ação Docente — etapa em atraso',
    `<p>O ciclo de avaliação do docente <b>${teacherName}</b> está atrasado na etapa <b>${STAGE_LABELS[stage] ?? stage}</b>. Acesse o sistema para verificar.</p>`
  );
}

export async function sendFeedbackRegisteredEmail(to: string, teacherName: string) {
  await sendMail(
    to,
    'Ação Docente — devolutiva registrada',
    `<p>Olá, ${teacherName}.</p><p>Sua devolutiva da Ação Docente foi registrada pelo gestor. Acesse o sistema para visualizar os apontamentos e confirmar ciência.</p>`
  );
}
