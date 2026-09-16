'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SenaiLogo } from '@/components/SenaiLogo';
import { Eye, EyeOff, Lock, BadgeCheck, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nif: identifier, email: identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Credenciais inválidas');
        return;
      }
      if (data.mustChangePassword) { router.push('/trocar-senha'); return; }
      if (data.role === 'docente') router.push('/docente');
      else router.push('/gestor');
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #211C5C 0%, #130F35 60%, #211C5C 100%)' }}>
      <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <SenaiLogo size="lg" />
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.2)' }} />
        <div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
            Sistema de
          </p>
          <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            AÇÃO DOCENTE
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(67,56,202,0.15)',
              border: '2px solid rgba(67,56,202,0.4)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <GraduationCap size={32} color="#4338CA" />
            </div>
            <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Bem-vindo
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Acesse sua conta para continuar
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  NIF — Número de Identificação
                </label>
                <div style={{ position: 'relative' }}>
                  <BadgeCheck size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Seu NIF"
                    required
                    autoComplete="username"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '0.5rem',
                      padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#4338CA'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Senha
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '0.5rem',
                      padding: '0.65rem 2.5rem 0.65rem 2.5rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#4338CA'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: 'rgba(67,56,202,0.15)', border: '1px solid rgba(67,56,202,0.4)', borderRadius: '0.4rem', padding: '0.6rem 0.8rem', color: '#FF8A80', fontSize: '0.83rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#2E2678' : '#4338CA',
                  color: 'white',
                  padding: '0.8rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.05em',
                  transition: 'background 0.2s',
                  marginTop: '0.25rem'
                }}
              >
                {loading ? 'Entrando...' : 'ENTRAR'}
              </button>

              <Link href="/esqueci-senha" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', textDecoration: 'none' }}>
                Esqueci minha senha
              </Link>
            </form>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            Credenciais fornecidas pelo coordenador
          </p>
        </div>
      </div>
    </div>
  );
}
