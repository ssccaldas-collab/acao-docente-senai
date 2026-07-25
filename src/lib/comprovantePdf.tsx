import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { put, del } from '@vercel/blob';
import { getDB } from './db';
import { STAGE1_DOCUMENTATION_QUESTIONS, STAGE2_CLASSROOM_OBSERVATION_QUESTIONS, type FormAnswers, type FormQuestion } from './formQuestions';

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  headerBar: { backgroundColor: '#211C5C', padding: 14, marginBottom: 18, borderRadius: 4 },
  headerTitle: { color: 'white', fontSize: 15, fontFamily: 'Helvetica-Bold' },
  headerSubtitle: { color: '#C7C4E8', fontSize: 9, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  infoLabel: { fontSize: 8, color: '#888', textTransform: 'uppercase' },
  infoValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#211C5C', marginTop: 1 },
  sectionTitle: {
    fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#211C5C',
    marginTop: 16, marginBottom: 6, borderBottom: '1pt solid #E0E0E0', paddingBottom: 3,
  },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottom: '0.5pt solid #F0F0F0' },
  questionLabel: { flex: 1, paddingRight: 8 },
  answerValue: { fontFamily: 'Helvetica-Bold', width: 70, textAlign: 'right' },
  commentText: { marginTop: 4, fontSize: 9, color: '#555', fontStyle: 'italic' },
  freeText: { fontSize: 10, lineHeight: 1.4, marginTop: 4 },
  emptyText: { fontSize: 9, color: '#999', fontStyle: 'italic' },
  signaturesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, gap: 20 },
  signatureBox: { flex: 1, alignItems: 'center' },
  signatureImg: { width: 200, height: 70, objectFit: 'contain', border: '1pt solid #E0E0E0', borderRadius: 4 },
  signatureName: { marginTop: 6, fontSize: 9, fontFamily: 'Helvetica-Bold' },
  signatureRole: { fontSize: 8, color: '#888' },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 7, color: '#aaa', textAlign: 'center' },
});

function answerLabel(q: FormQuestion, answers: FormAnswers): string {
  const v = answers?.[q.id]?.value;
  if (v === undefined || v === null || v === '') return '—';
  if (q.type === 'sim_nao') return v === 'ok' ? 'OK' : 'NÃO OK';
  if (q.type === 'nota') return `${v}/${q.scale?.max ?? 5}`;
  return String(v);
}

function QuestionsBlock({ questions, answers, comment }: { questions: FormQuestion[]; answers: FormAnswers; comment?: string | null }) {
  const checklist = questions.filter(q => q.type !== 'texto');
  const freeform = questions.filter(q => q.type === 'texto');
  return (
    <View>
      {checklist.map(q => (
        <View key={q.id} style={styles.questionRow}>
          <Text style={styles.questionLabel}>{q.label}</Text>
          <Text style={styles.answerValue}>{answerLabel(q, answers)}</Text>
        </View>
      ))}
      {freeform.map(q => {
        const v = answers?.[q.id]?.value;
        return (
          <View key={q.id} style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 8, color: '#888' }}>{q.label}</Text>
            <Text style={styles.freeText}>{v ? String(v) : '—'}</Text>
          </View>
        );
      })}
      {comment && (
        <View style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 8, color: '#888' }}>Comentário geral</Text>
          <Text style={styles.freeText}>{comment}</Text>
        </View>
      )}
    </View>
  );
}

interface ComprovanteData {
  teacher_name: string;
  manager_name: string | null;
  semester_label: string;
  closed_at: string | Date;
  stage1: { answers: FormAnswers; overall_comment: string | null; reviewed_by_name: string } | null;
  stage2: { answers: FormAnswers; overall_comment: string | null; observation_date: string | null; observed_by_name: string } | null;
  stage3: { session_date: string; notes: string; applied_by_name: string; teacher_acknowledged: boolean } | null;
  stage4: {
    final_result: string; notes: string | null;
    manager_signature: string; docente_signature: string;
    closed_by_name: string; docente_signed_at: string | Date;
  };
}

const RESULT_LABELS: Record<string, string> = {
  adequado: 'Adequado',
  parcialmente_adequado: 'Parcialmente adequado',
  inadequado: 'Inadequado',
};

function ComprovanteDocument({ data }: { data: ComprovanteData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>SENAI — Comprovante de Ação Docente</Text>
          <Text style={styles.headerSubtitle}>Registro de encerramento do ciclo de avaliação semestral</Text>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.infoLabel}>Docente</Text>
            <Text style={styles.infoValue}>{data.teacher_name}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>Semestre</Text>
            <Text style={styles.infoValue}>{data.semester_label}</Text>
          </View>
          <View>
            <Text style={styles.infoLabel}>Gestor responsável</Text>
            <Text style={styles.infoValue}>{data.manager_name ?? '—'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Etapa 1 — Documentação</Text>
        {data.stage1 ? (
          <>
            <QuestionsBlock questions={STAGE1_DOCUMENTATION_QUESTIONS} answers={data.stage1.answers} comment={data.stage1.overall_comment} />
            <Text style={{ fontSize: 8, color: '#999', marginTop: 4 }}>Avaliado por {data.stage1.reviewed_by_name}</Text>
          </>
        ) : <Text style={styles.emptyText}>Não respondido</Text>}

        <Text style={styles.sectionTitle}>Etapa 2 — Observação de Aula</Text>
        {data.stage2 ? (
          <>
            <QuestionsBlock questions={STAGE2_CLASSROOM_OBSERVATION_QUESTIONS} answers={data.stage2.answers} comment={data.stage2.overall_comment} />
            <Text style={{ fontSize: 8, color: '#999', marginTop: 4 }}>
              Observado por {data.stage2.observed_by_name}{data.stage2.observation_date ? ` em ${new Date(data.stage2.observation_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : ''}
            </Text>
          </>
        ) : <Text style={styles.emptyText}>Não respondido</Text>}

        <Text style={styles.sectionTitle}>Etapa 3 — Devolutiva</Text>
        {data.stage3 ? (
          <>
            <Text style={styles.freeText}>{data.stage3.notes}</Text>
            <Text style={{ fontSize: 8, color: '#999', marginTop: 4 }}>
              Aplicada por {data.stage3.applied_by_name} em {new Date(data.stage3.session_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              {' · '}Ciência do docente: {data.stage3.teacher_acknowledged ? 'confirmada' : 'não confirmada'}
            </Text>
          </>
        ) : <Text style={styles.emptyText}>Não registrada</Text>}

        <Text style={styles.sectionTitle}>Etapa 4 — Réplica / Resultado Final</Text>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#211C5C' }}>
          {RESULT_LABELS[data.stage4.final_result] ?? data.stage4.final_result}
        </Text>
        {data.stage4.notes && <Text style={styles.freeText}>{data.stage4.notes}</Text>}
        <Text style={{ fontSize: 8, color: '#999', marginTop: 4 }}>Fechado por {data.stage4.closed_by_name}</Text>

        <View style={styles.signaturesRow}>
          <View style={styles.signatureBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={data.stage4.manager_signature} style={styles.signatureImg} />
            <Text style={styles.signatureName}>{data.stage4.closed_by_name}</Text>
            <Text style={styles.signatureRole}>Gestor (Coordenador/OPP)</Text>
          </View>
          <View style={styles.signatureBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={data.stage4.docente_signature} style={styles.signatureImg} />
            <Text style={styles.signatureName}>{data.teacher_name}</Text>
            <Text style={styles.signatureRole}>Docente · assinado em {new Date(data.stage4.docente_signed_at).toLocaleString('pt-BR')}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Documento gerado automaticamente pelo Sistema de Ação Docente — SENAI, em {new Date().toLocaleString('pt-BR')}.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateComprovantePdf(cycleId: number): Promise<Buffer | null> {
  const sql = getDB();

  const cycles = await sql`
    SELECT ec.id, ec.stage3_deadline, t.name as teacher_name, m.name as manager_name, s.label as semester_label
    FROM evaluation_cycles ec
    JOIN users t ON t.id = ec.teacher_id
    LEFT JOIN users m ON m.id = ec.manager_id
    JOIN semesters s ON s.id = ec.semester_id
    WHERE ec.id = ${cycleId}
  `;
  if (cycles.length === 0) return null;
  const cycle = cycles[0];

  const [stage1Rows, stage2Rows, stage3Rows, stage4Rows] = await Promise.all([
    sql`SELECT r.answers, r.overall_comment, COALESCE(u.name, 'Usuário removido') as reviewed_by_name FROM stage1_documentation_reviews r LEFT JOIN users u ON u.id = r.reviewed_by WHERE cycle_id = ${cycleId}`,
    sql`SELECT o.answers, o.overall_comment, o.observation_date, COALESCE(u.name, 'Usuário removido') as observed_by_name FROM stage2_classroom_observations o LEFT JOIN users u ON u.id = o.observed_by WHERE cycle_id = ${cycleId}`,
    sql`SELECT f.session_date, f.notes, f.teacher_acknowledged, COALESCE(u.name, 'Usuário removido') as applied_by_name FROM stage3_feedback_sessions f LEFT JOIN users u ON u.id = f.applied_by WHERE cycle_id = ${cycleId}`,
    sql`SELECT r.final_result, r.notes, r.manager_signature, r.docente_signature, r.docente_signed_at, COALESCE(u.name, 'Usuário removido') as closed_by_name FROM stage4_replicas r LEFT JOIN users u ON u.id = r.closed_by WHERE cycle_id = ${cycleId}`,
  ]);

  const stage4 = stage4Rows[0];
  if (!stage4 || !stage4.manager_signature || !stage4.docente_signature) return null;

  const data: ComprovanteData = {
    teacher_name: cycle.teacher_name as string,
    manager_name: cycle.manager_name as string | null,
    semester_label: cycle.semester_label as string,
    closed_at: new Date(),
    stage1: (stage1Rows[0] as ComprovanteData['stage1']) ?? null,
    stage2: (stage2Rows[0] as ComprovanteData['stage2']) ?? null,
    stage3: (stage3Rows[0] as ComprovanteData['stage3']) ?? null,
    stage4: stage4 as unknown as ComprovanteData['stage4'],
  };

  const buffer = await renderToBuffer(<ComprovanteDocument data={data} />);
  return buffer;
}

/**
 * Gera o PDF do comprovante e sobe pro Blob, substituindo um comprovante anterior se existir.
 * Retorna o pathname salvo, ou null se o ciclo ainda não tem as duas assinaturas.
 */
export async function generateAndStoreComprovante(cycleId: number): Promise<string | null> {
  const sql = getDB();
  const buffer = await generateComprovantePdf(cycleId);
  if (!buffer) return null;

  const existing = await sql`SELECT comprovante_blob_pathname FROM evaluation_cycles WHERE id = ${cycleId}`;
  const oldPathname = existing[0]?.comprovante_blob_pathname as string | null;
  if (oldPathname) {
    try { await del(oldPathname); } catch { /* segue mesmo se não existir mais */ }
  }

  const blob = await put(`comprovantes/ciclo-${cycleId}/comprovante-${Date.now()}.pdf`, buffer, {
    access: 'private',
    contentType: 'application/pdf',
    addRandomSuffix: true,
  });

  await sql`
    UPDATE evaluation_cycles SET comprovante_blob_pathname = ${blob.pathname}, comprovante_generated_at = NOW()
    WHERE id = ${cycleId}
  `;

  return blob.pathname;
}
