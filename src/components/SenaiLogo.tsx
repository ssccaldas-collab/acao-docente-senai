'use client';

const sizes = {
  sm: { width: 72, height: 28 },
  md: { width: 100, height: 38 },
  lg: { width: 130, height: 50 },
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
      style={{ objectFit: 'contain' }}
    />
  );
}
