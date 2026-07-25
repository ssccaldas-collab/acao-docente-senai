'use client';

// Proporção real do arquivo original: 1920x492 (~3.9:1)
const sizes = {
  sm: { width: 94, height: 24 },
  md: { width: 137, height: 35 },
  lg: { width: 176, height: 45 },
};

export function SenaiLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = sizes[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/senai-logo.png"
      alt="SENAI"
      width={s.width}
      height={s.height}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
}
