import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import fs from 'fs';
const envContent = fs.readFileSync('.env.local', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
const sql = neon(dbUrlMatch[1].trim());
const passHash = await bcrypt.hash('Teste@123', 10);
await sql`DELETE FROM users WHERE registration_number = 'TESTSMTPDIAG'`;
const u = await sql`INSERT INTO users (name, email, registration_number, password_hash, role, active, must_change_password)
  VALUES ('Teste SMTP Diag', 'teste.smtpdiag@example.com', 'TESTSMTPDIAG', ${passHash}, 'coordenador', true, false) RETURNING id`;
console.log(JSON.stringify({ userId: u[0].id }));
