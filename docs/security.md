# Segurança, Papéis e Acesso

Guia resumido para implementar controle de sessão, papéis e notificações.

## Sessão e guard de rota
- Usar Supabase Auth; inicializar cliente em `src/lib/supabaseClient.ts`.
- `AuthGate` e `RoleGate` (ver `src/components/guards`) bloqueiam rotas sem sessão e redirecionam para `/login`.
- Se houver sessão mas sem autorização para o módulo, exibir fallback amigável (`AccessDenied`).

## Papéis
- Papéis previstos (Supabase): `client_owner`, `client_user`, `internal_admin`, `internal_staff`.
- Níveis de acesso (negócio):
  - **Admin** → `internal_admin` ou `internal_staff` (time Q7 OPS, cria boletos, posts, notícias).
  - **Usuário** → `client_owner` ou `client_user` (cliente, visualiza e aprova fluxos).
- Mapeamento sugerido por módulo:
  - Admin/staff: acesso completo.
  - Client_owner: leitura + ações de aprovação, pagamentos, uploads.
  - Client_user: leitura, concluir tarefas, visualizar financeiro, aprovar posts.
- Tela de criação de clientes: restrita a Admin; exige email, nome, org e papel (`client_owner` ou `client_user`). Service role/Edge Function deve validar papel do chamador antes de criar usuário e inserir em `user_organizations`.
- Fonte de verdade: tabela `user_organizations` + RLS. Token JWT deve carregar `organization_id` ativo e papel. Em UI, usar `getUserRole` (ver `src/lib/permissions.ts`).

## RLS (Supabase)
- Todas as tabelas de domínio devem ter `organization_id` e aplicar políticas:
  - select/update/delete/insert somente se `public.is_org_member(organization_id)`.
  - inserções privilegiadas para `internal_admin` e `internal_staff` quando necessário.
- Funções auxiliares em `supabase/schema.sql`:
  - `is_org_member(org_id uuid)`
  - `has_role(org_id uuid, roles public.user_role[])`

## Notificações
- Tabela `notifications` com leitura filtrada por org e destinatário (`supabase/schema.sql`).
- Função `notify_event` em `supabase/notifications.sql` para ser chamada por triggers/edge functions dos módulos:
  - tarefa concluída
  - pagamento confirmado
  - nova reunião
  - postagem aprovada
  - novo boleto emitido
- UI: feed em cards finos com ação de marcar como lida (ver guidelines em plan.md).

## Auditoria
- Padrão por tabela: `created_at`, `updated_at`, `created_by`, `updated_by`.
- Em eventos críticos (termo, pagamentos), registrar `ip` e `user_agent`.
