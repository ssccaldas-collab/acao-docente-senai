import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { sendDeadlineReminderEmail, sendOverdueEmail, sendTeacherOverdueEmail } from '@/lib/mailer';

// Dias antes do prazo da Etapa 1 em que o docente recebe um lembrete (0 = no dia do vencimento).
const REMINDER_THRESHOLDS_DAYS = [5, 2, 1, 0];

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sql = getDB();
  let remindersSent = 0;
  let overdueFound = 0;

  // 1. Lembretes escalonados ao docente conforme o prazo da Etapa 1 se aproxima
  for (const daysLeft of REMINDER_THRESHOLDS_DAYS) {
    const notifType = `stage1_deadline_reminder_${daysLeft}d`;
    const upcomingStage1 = await sql`
      SELECT ec.id, ec.stage1_deadline, u.email, u.name
      FROM evaluation_cycles ec
      JOIN users u ON u.id = ec.teacher_id
      WHERE ec.current_stage = 1
        AND ec.status NOT IN ('concluido', 'cancelado')
        AND ec.stage1_deadline = CURRENT_DATE + (${daysLeft} * INTERVAL '1 day')
        AND NOT EXISTS (
          SELECT 1 FROM notification_log nl
          WHERE nl.cycle_id = ec.id AND nl.notification_type = ${notifType}
        )
    `;
    for (const row of upcomingStage1 as { id: number; email: string; name: string; stage1_deadline: string }[]) {
      await sendDeadlineReminderEmail(row.email, row.name, new Date(row.stage1_deadline).toLocaleDateString('pt-BR', { timeZone: 'UTC' }), daysLeft);
      await sql`
        INSERT INTO notification_log (cycle_id, recipient_id, notification_type)
        SELECT ${row.id}, teacher_id, ${notifType} FROM evaluation_cycles WHERE id = ${row.id}
        ON CONFLICT DO NOTHING
      `;
      remindersSent++;
    }
  }

  // 2. Aviso ao gestor + marcação de atraso: prazo vencido em qualquer etapa
  const overdue = await sql`
    SELECT ec.id, ec.current_stage, ec.teacher_id, ec.manager_id, m.email as manager_email,
      u.name as teacher_name, u.email as teacher_email,
      CASE ec.current_stage
        WHEN 1 THEN ec.stage1_deadline WHEN 2 THEN ec.stage2_deadline
        WHEN 3 THEN ec.stage3_deadline ELSE ec.stage4_deadline
      END as current_deadline
    FROM evaluation_cycles ec
    JOIN users u ON u.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    WHERE ec.status NOT IN ('concluido', 'cancelado')
  `;

  for (const row of overdue as { id: number; current_stage: number; teacher_id: number; manager_id: number | null; manager_email: string | null; teacher_name: string; teacher_email: string; current_deadline: string | null }[]) {
    if (!row.current_deadline || new Date(row.current_deadline) >= new Date(new Date().toISOString().slice(0, 10))) continue;

    await sql`UPDATE evaluation_cycles SET status = 'atrasado' WHERE id = ${row.id} AND status != 'atrasado'`;
    overdueFound++;

    const notifType = `stage${row.current_stage}_overdue_manager`;
    const already = await sql`SELECT 1 FROM notification_log WHERE cycle_id = ${row.id} AND notification_type = ${notifType}`;
    if (already.length === 0 && row.manager_email) {
      await sendOverdueEmail(row.manager_email, row.teacher_name, row.current_stage);
      await sql`INSERT INTO notification_log (cycle_id, recipient_id, notification_type) VALUES (${row.id}, ${row.manager_id}, ${notifType}) ON CONFLICT DO NOTHING`;
    }

    // Etapa 1 é a única cujo prazo é do próprio docente — avisa ele também que venceu.
    if (row.current_stage === 1) {
      const teacherNotifType = 'stage1_overdue_teacher';
      const teacherAlready = await sql`SELECT 1 FROM notification_log WHERE cycle_id = ${row.id} AND notification_type = ${teacherNotifType}`;
      if (teacherAlready.length === 0) {
        await sendTeacherOverdueEmail(row.teacher_email, row.teacher_name);
        await sql`INSERT INTO notification_log (cycle_id, recipient_id, notification_type) VALUES (${row.id}, ${row.teacher_id}, ${teacherNotifType}) ON CONFLICT DO NOTHING`;
      }
    }
  }

  return NextResponse.json({ ok: true, remindersSent, overdueFound });
}
