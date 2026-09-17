import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSession, isMaster } from '@/lib/auth';

// Rota de diagnóstico TEMPORÁRIA — investigar falha real de envio de e-mail em produção.
// Remover após o diagnóstico.
export async function GET() {
  const session = await getSession();
  if (!session || !isMaster(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const envInfo = {
    SMTP_HOST: process.env.SMTP_HOST ?? null,
    SMTP_PORT: process.env.SMTP_PORT ?? null,
    SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 4)}***` : null,
    SMTP_FROM: process.env.SMTP_FROM ?? null,
    SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length ?? 0,
  };

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  let verifyOk = false;
  let verifyMs = 0;
  let verifyError: unknown = null;
  const t0 = Date.now();
  try {
    await transport.verify();
    verifyOk = true;
  } catch (err) {
    verifyError = err instanceof Error ? { name: err.name, message: err.message, code: (err as NodeJS.ErrnoException).code, command: (err as { command?: string }).command } : String(err);
  }
  verifyMs = Date.now() - t0;

  let sendOk = false;
  let sendMs = 0;
  let sendError: unknown = null;
  const t1 = Date.now();
  try {
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@senai.br';
    await transport.sendMail({
      from: `Ação Docente SENAI <${fromAddress}>`,
      to: session.email,
      subject: 'Teste de diagnóstico SMTP',
      html: '<p>Teste de diagnóstico do sistema de e-mail.</p>',
    });
    sendOk = true;
  } catch (err) {
    sendError = err instanceof Error ? { name: err.name, message: err.message, code: (err as NodeJS.ErrnoException).code, command: (err as { command?: string }).command } : String(err);
  }
  sendMs = Date.now() - t1;

  return NextResponse.json({ envInfo, verifyOk, verifyMs, verifyError, sendOk, sendMs, sendError, sentTo: session.email });
}