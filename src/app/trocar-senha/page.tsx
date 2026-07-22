'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SenaiLogo } from '@/components/SenaiLogo';
import { Eye, EyeOff, Lock, KeyRound } from 'lucide-react';

export default function TrocarSenhaPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/trocar-senha', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao trocar a senha');
        return;
      }
      router.push('/');
      router.refresh();
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
              Troque sua senha
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Este é seu primeiro acesso. Defina uma nova senha para continuar.
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
                  Senha atual
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="Senha fornecida pelo coordenador"
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '0.5rem', padding: '0.65rem 2.5rem 0.65rem 2.5rem', color: 'white', fontSize: '0.9rem', outline: 'none',
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

              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Nova senha
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete="new-password"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '0.5rem', padding: '0.65rem 0.75rem', color: 'white', fontSize: '0.9rem', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#4338CA'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Confirmar nova senha
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  autoComplete="new-password"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '0.5rem', padding: '0.65rem 0.75rem', color: 'white', fontSize: '0.9rem', outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#4338CA'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                />
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
                  width: '100%', background: loading ? '#2E2678' : '#4338CA', color: 'white', padding: '0.8rem',
                  borderRadius: '0.5rem', border: 'none', fontSize: '0.95rem', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.05em', transition: 'background 0.2s', marginTop: '0.25rem'
                }}
              >
                {loading ? 'Salvando...' : 'SALVAR NOVA SENHA'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
