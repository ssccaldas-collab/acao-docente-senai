import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';
import { getDB } from '@/lib/db';

// Tabelas do schema atual (src/lib/db.ts) — exportação lógica completa, não um dump binário.
const TABLES = [
  'users',
  'semesters',
  'evaluation_cycles',
  'documents',
  'stage1_documentation_reviews',
  'stage2_classroom_observations',
  'stage3_feedback_sessions',
  'stage4_replicas',
  'notification_log',
  'password_resets',
];

const RETENTION_DAYS = 30;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sql = getDB();
  const tables: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    tables[table] = await sql.query(`SELECT * FROM ${table}`);
  }

  const generatedAt = new Date();
  const dateStr = generatedAt.toISOString().slice(0, 10);
  const payload = JSON.stringify({ generated_at: generatedAt.toISOString(), tables }, null, 0);

  const blob = await put(`backups/backup-${dateStr}.json`, payload, {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  let pruned = 0;
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const { blobs } = await list({ prefix: 'backups/' });
  for (const b of blobs) {
    if (new Date(b.uploadedAt).getTime() < cutoff) {
      await del(b.pathname);
      pruned++;
    }
  }

  return NextResponse.json({
    ok: true,
    pathname: blob.pathname,
    rowCounts: Object.fromEntries(Object.entries(tables).map(([t, rows]) => [t, rows.length])),
    pruned,
  });
}