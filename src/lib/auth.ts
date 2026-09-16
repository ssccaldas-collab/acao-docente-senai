import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');

export type Role = 'docente' | 'oppp' | 'coordenador' | 'master';

export interface JWTPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  unidade: string | null;
}

export function isGestor(role: Role): boolean {
  return role === 'oppp' || role === 'coordenador' || role === 'master';
}

export function isMaster(role: Role): boolean {
  return role === 'master';
}

// Master enxerga tudo, independente de unidade. Um gestor comum só acessa dados
// da própria unidade — usar sempre que uma rota expuser dado de um docente/ciclo.
export function canAccessUnidade(session: JWTPayload, targetUnidade: string | null): boolean {
  if (isMaster(session.role)) return true;
  return session.unidade !== null && session.unidade === targetUnidade;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}