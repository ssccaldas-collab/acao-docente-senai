import { neon } from '@neondatabase/serverless';

export function getDB() {
  const url = process.env.DATABASE_URL;
  if (!url || url === 'your_neon_connection_string_here') {
    throw new Error('DATABASE_URL não configurado. Adicione sua connection string do Neon no arquivo .env.local');
  }
  return neon(url);
}

export async function initDB() {
  const sql = getDB();

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      registration_number VARCHAR(20),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('docente','oppp','coordenador')),
      active BOOLEAN DEFAULT TRUE,
      must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS unidade VARCHAR(20)`;
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`;
  await sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('docente','oppp','coordenador','master'))`;

  await sql`
    CREATE TABLE IF NOT EXISTS semesters (
      id SERIAL PRIMARY KEY,
      label VARCHAR(60) NOT NULL UNIQUE,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      default_stage1_deadline DATE,
      default_stage2_deadline DATE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE semesters ALTER COLUMN label TYPE VARCHAR(60)`;

  await sql`
    CREATE TABLE IF NOT EXISTS evaluation_cycles (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester_id INTEGER NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
      manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      current_stage SMALLINT NOT NULL DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 4),
      status VARCHAR(20) NOT NULL DEFAULT 'nao_iniciado'
        CHECK (status IN ('nao_iniciado','em_andamento','concluido','atrasado','cancelado')),
      stage1_deadline DATE,
      stage2_deadline DATE,
      stage3_deadline DATE,
      stage4_deadline DATE,
      comprovante_blob_pathname TEXT,
      comprovante_generated_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE evaluation_cycles ADD COLUMN IF NOT EXISTS comprovante_blob_pathname TEXT`;
  await sql`ALTER TABLE evaluation_cycles ADD COLUMN IF NOT EXISTS comprovante_generated_at TIMESTAMP`;
  // Só o gestor que iniciou o ciclo (manager_id) pode editá-lo, a menos que autorize outro
  // gestor da mesma unidade explicitamente via authorized_gestor_id.
  await sql`ALTER TABLE evaluation_cycles ADD COLUMN IF NOT EXISTS authorized_gestor_id INTEGER REFERENCES users(id) ON DELETE SET NULL`;
  // Um docente pode ter mais de um ciclo por semestre ao longo do tempo (histórico de reinícios);
  // a unicidade de "ciclo ativo" é garantida pela aplicação, não pelo banco.
  await sql`ALTER TABLE evaluation_cycles DROP CONSTRAINT IF EXISTS evaluation_cycles_teacher_id_semester_id_key`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cycles_teacher ON evaluation_cycles(teacher_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cycles_semester ON evaluation_cycles(semester_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cycles_status ON evaluation_cycles(status)`;

  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      document_type VARCHAR(50),
      file_name VARCHAR(500) NOT NULL,
      blob_url TEXT NOT NULL,
      blob_pathname TEXT NOT NULL,
      size_bytes INTEGER,
      content_type VARCHAR(100),
      uploaded_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_cycle ON documents(cycle_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS stage1_documentation_reviews (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER NOT NULL UNIQUE REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      answers JSONB NOT NULL,
      overall_comment TEXT,
      reviewed_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE stage1_documentation_reviews ALTER COLUMN reviewed_by DROP NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS stage2_classroom_observations (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER NOT NULL UNIQUE REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
      observed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      observation_date DATE,
      answers JSONB NOT NULL,
      overall_comment TEXT,
      observed_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE stage2_classroom_observations ALTER COLUMN observed_by DROP NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS stage3_feedback_sessions (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER NOT NULL UNIQUE REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
      applied_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      session_date DATE NOT NULL,
      notes TEXT NOT NULL,
      teacher_acknowledged BOOLEAN DEFAULT FALSE,
      teacher_acknowledged_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE stage3_feedback_sessions ALTER COLUMN applied_by DROP NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS stage4_replicas (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER NOT NULL UNIQUE REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
      closed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      final_result VARCHAR(30) CHECK (final_result IN ('adequado','parcialmente_adequado','inadequado')),
      notes TEXT,
      manager_signature TEXT,
      docente_signature TEXT,
      docente_signed_at TIMESTAMP,
      closed_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE stage4_replicas ALTER COLUMN closed_by DROP NOT NULL`;
  await sql`ALTER TABLE stage4_replicas ADD COLUMN IF NOT EXISTS manager_signature TEXT`;
  await sql`ALTER TABLE stage4_replicas ADD COLUMN IF NOT EXISTS docente_signature TEXT`;
  await sql`ALTER TABLE stage4_replicas ADD COLUMN IF NOT EXISTS docente_signed_at TIMESTAMP`;

  await sql`
    CREATE TABLE IF NOT EXISTS notification_log (
      id SERIAL PRIMARY KEY,
      cycle_id INTEGER REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
      recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      notification_type VARCHAR(50) NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (cycle_id, notification_type)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}
