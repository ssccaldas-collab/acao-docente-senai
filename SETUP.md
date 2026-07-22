# Sistema de Ação Docente — SENAI

## Configuração inicial

### 1. Banco de dados Neon

1. Acesse https://neon.tech e crie um novo projeto (ex: `acao-docente-senai`)
2. Copie a **Connection String** (formato: `postgresql://user:pass@host/dbname?sslmode=require`)
3. Abra `.env.local` e substitua `your_neon_connection_string_here` pela sua connection string

### 2. Vercel Blob (upload de documentos)

1. No painel da Vercel, crie um Blob Store para o projeto
2. Copie o `BLOB_READ_WRITE_TOKEN` gerado e cole em `.env.local`

### 3. Configuração de e-mail (opcional)

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` em `.env.local`. Se não configurar, o sistema funciona normalmente, apenas sem envio de lembretes/alertas de prazo.

### 4. CRON_SECRET

Gere uma string aleatória e coloque em `CRON_SECRET` — é o segredo usado pelo Vercel Cron para autenticar a chamada diária de verificação de prazos (`/api/cron/verificar-prazos`).

### 5. Iniciar o banco de dados

```bash
npm run dev
```

Com o servidor rodando, crie as tabelas e o coordenador padrão:

```bash
curl -X POST http://localhost:3000/api/init
```

### 6. Login padrão do coordenador

- **NIF/e-mail:** coordenador@senai.br
- **Senha:** senai@2024

No primeiro acesso (de qualquer usuário, incluindo esse coordenador padrão), o sistema **obriga a troca de senha** antes de liberar o restante das telas.

### 7. Login por NIF

Assim como no sistema irmão `patrimonio`, o login é feito pelo **NIF** (campo `registration_number` no banco) cadastrado para cada usuário — o e-mail continua funcionando como alternativa de login. Ao cadastrar um docente/OPP/coordenador em "Usuários", defina uma senha inicial; esse usuário será obrigado a trocá-la no primeiro login.

## Executar o sistema

```bash
npm run dev
```

Acesse: http://localhost:3000

## Fluxo de uso

1. **Coordenador/OPP** cadastra docentes e gestores em "Usuários" e cria o semestre em "Semestres"
2. **Coordenador/OPP** gera os ciclos de avaliação do semestre (1 por docente)
3. **Docente** faz login, sobe a documentação (Etapa 1) dentro do prazo
4. **Gestor** avalia a documentação, observa a aula (Etapa 2), registra a devolutiva (Etapa 3) e fecha o ciclo com a réplica (Etapa 4)
5. Lembretes de prazo são enviados automaticamente por e-mail (cron diário)
