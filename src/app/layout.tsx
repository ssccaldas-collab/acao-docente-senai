import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ação Docente — SENAI',
  description: 'Sistema de execução e gerenciamento da Ação Docente SENAI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ação Docente SENAI" />
        <link rel="apple-touch-icon" href="/icon-app.png" />
        <meta name="theme-color" content="#4338CA" />
      </head>
      <body style={{ minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
