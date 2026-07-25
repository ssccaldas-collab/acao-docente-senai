import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSession, isGestor } from '@/lib/auth';

// Rota de diagnóstico temporária — remover depois de confirmar o envio de e-mail em produção.
export async function GET() {
  const session = await getSession();
  if (!session || !isGestor(session.role)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const env = {
    SMTP_HOST: process.env.SMTP_HOST || null,
    SMTP_PORT: process.env.SMTP_PORT || null,
    SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}***` : null,
    SMTP_PASS_SET: Boolean(process.env.SMTP_PASS),
    APP_URL: process.env.APP_URL || null,
  };

  if (!process.env.SMTP_HOST) {
    return NextResponse.json({ env, error: 'SMTP_HOST ausente' }, { status: 200 });
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 8000,
  });

  const started = Date.now();
  try {
    await transport.verify();
    const elapsedVerify = Date.now() - started;
    const sendStart = Date.now();
    const info = await transport.sendMail({
      from: `Ação Docente SENAI <${process.env.SMTP_USER}>`,
      to: session.email,
      subject: '🎓 Teste de diagnóstico — Ação Docente',
      html: '<p>Se você recebeu este e-mail, o SMTP está funcionando em produção.</p>',
    });
    return NextResponse.json({
      env, ok: true, verifyMs: elapsedVerify, sendMs: Date.now() - sendStart,
      messageId: info.messageId, response: info.response,
    });
  } catch (err) {
    return NextResponse.json({
      env, ok: false, elapsedMs: Date.now() - started,
      error: err instanceof Error ? { message: err.message, name: err.name, code: (err as { code?: string }).code } : String(err),
    }, { status: 200 });
  }
}
