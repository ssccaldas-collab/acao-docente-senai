import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSession, isGestor } from '@/lib/auth';

// Rota de diagnóstico temporária — remover depois de confirmar o envio de e-mail em produção.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const to = new URL(req.url).searchParams.get('to') || session.email;

  const env = {
    SMTP_HOST: process.env.SMTP_HOST || null,
    SMTP_PORT: process.env.SMTP_PORT || null,
    SMTP_USER: process.env.SMTP_USER || null,
    SMTP_FROM: process.env.SMTP_FROM || null,
    SMTP_PASS_SET: Boolean(process.env.SMTP_PASS),
  };

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 12000,
    greetingTimeout: 12000,
    socketTimeout: 15000,
  });

  const started = Date.now();
  try {
    await transport.verify();
    const verifyMs = Date.now() - started;
    const sendStart = Date.now();
    const info = await transport.sendMail({
      from: `Ação Docente SENAI <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: '🎓 Diagnóstico de envio — Ação Docente',
      html: `<p>Diagnóstico de entrega para ${to}.</p>`,
    });
    return NextResponse.json({
      env, to, ok: true, verifyMs, sendMs: Date.now() - sendStart,
      messageId: info.messageId, response: info.response, accepted: info.accepted, rejected: info.rejected,
    });
  } catch (err) {
    return NextResponse.json({
      env, to, ok: false, elapsedMs: Date.now() - started,
      error: err instanceof Error ? { message: err.message, name: err.name, code: (err as { code?: string; responseCode?: number }).code, responseCode: (err as { responseCode?: number }).responseCode } : String(err),
    });
  }
}