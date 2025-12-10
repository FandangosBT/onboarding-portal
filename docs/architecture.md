# Arquitetura e Preparação

Guia para levantar o projeto alinhado ao PRD, IDV e padrão Awwwards.

## Stack frontend
- Vite + React 18 + TypeScript + React Router 6 para rotas protegidas.
- Supabase JS client (Auth + Postgres + Storage + Edge Functions).
- CSS com tokens globais e componentes base em `src/styles/tokens.css`; microinterações leves via CSS (framer-motion/GSAP opcionais para telas ricas).
- Fetching/cache sugerido: React Query; state local por módulo para formularios e filtros.

## Variáveis de ambiente
- Copiar `.env.example` para `.env.local` e preencher `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_JWT_SECRET`.
- Buckets padrão referenciados nas envs: `public-assets` (público) e `secure-docs` (privado).

## Supabase: schema e RLS (ver `supabase/schema.sql`)
- Tabelas-chave: `organizations`, `user_organizations` (papéis `client_owner`, `client_user`, `internal_admin`, `internal_staff`), `notifications`.
- Funções utilitárias: `is_org_member(org_id)` e `has_role(org_id, roles[])` para centralizar RLS.
- Políticas aplicadas por tabela: leitura apenas para membros da org; inserções/atualizações liberadas conforme papel (admin/staff).
- Padrão para tabelas de domínio: sempre incluir `organization_id uuid not null` e aplicar `is_org_member` nas políticas de select/update/delete/insert.

## Storage
- Buckets recomendados:
  - `public-assets` (público) para ícones e fundos neutros.
  - `secure-docs` (privado) para termos, boletos, comprovantes.
- Estrutura de paths: `org/{ano}/{mes}/{contexto}/{filename}` para facilitar limpeza e auditoria.
- Armazenar `organization_id` em `metadata` de cada objeto e replicar a checagem de RLS no Storage.

## Notificações internas
- Tabela `notifications` inclui org, ator, destinatário opcional, tipo, título, corpo, origem, timestamps.
- Triggers/edge functions (a serem implementadas por módulo) devem disparar em:
  - tarefa concluída,
  - pagamento confirmado,
  - nova reunião,
  - postagem aprovada,
  - novo boleto emitido.

## Rotas e layout base
- Rotas mapeadas: `/login`, `/termo`, `/onboarding`, `/financeiro`, `/calendario`, `/crm`, `/reunioes`, `/avisos`, `/dashboard`.
- Layout shell dark: app bar com status e usuário, sidebar minimal com ícones geométricos dourados, conteúdo em cards `surface`.
- Rotas protegidas: bloquear tudo exceto `/login` e `/termo` (se ainda não assinado).
