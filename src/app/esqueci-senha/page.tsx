'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SenaiLogo } from '@/components/SenaiLogo';
import { KeyRound, BadgeCheck, ArrowLeft } from 'lucide-react';

export default function EsqueciSenhaPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      setSent(true);
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
              <KeyRound size={32} color="#4338CA" />
            </div>
            <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Esqueci minha senha
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Informe seu NIF ou e-mail cadastrado
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'white', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Se o NIF ou e-mail informado existir em nossa base, enviamos um link de redefinição de senha para o e-mail cadastrado. Confira também a caixa de spam.
                </p>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', color: '#9186FF', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
                  <ArrowLeft size={15} /> Voltar para o login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    NIF ou e-mail
                  </label>
                  <div style={{ position: 'relative' }}>
                    <BadgeCheck size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="Seu NIF ou e-mail"
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
                  }}
                >
                  {loading ? 'Enviando...' : 'ENVIAR LINK DE REDEFINIÇÃO'}
                </button>

                <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.83rem', textDecoration: 'none' }}>
                  <ArrowLeft size={14} /> Voltar para o login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
