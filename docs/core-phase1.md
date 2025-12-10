# Fase 1 — Core Operacional

Escopo: autenticação, termo de adesão, onboarding e feed de avisos.

## Supabase (schema)
- Aplicar `supabase/schema.sql` e `supabase/schema.core_phase1.sql`.
- Funções principais:
  - `self_join_organization(org, role)` para vincular usuário logado à organização (apenas roles de cliente).
  - `provision_onboarding_instance(org, template, user)` para gerar uma instância a partir de template.
  - `notify_event(...)` para criar avisos.
- Tabelas novas: `terms`, `term_signatures`, `onboarding_*` (templates, steps, tasks, instances).
- RLS: leitura/ação limitada a membros da organização; templates e termos acessíveis a autenticados.

## Fluxo de Autenticação
- Tela `Login` oferece: login, cadastro e reset de senha.
- Após cadastro, chamar `self_join_organization` com o `organization_id` do cliente e papel `client_user` ou `client_owner`.
- Papel exibido na UI via `user_metadata.role` ou `app_metadata.role`.

## Termo de Adesão
- Tela `Termo` busca termo ativo (`terms.is_active=true` maior versão).
- Assinatura grava: `term_id`, `organization_id`, `user_id`, `user_email`, `user_name`, `ip`, `user_agent`, `signed_at`.
- Gate: se usuário não assinou o termo ativo da sua organização, bloquear demais rotas (usar `TermGate`).

## Checklist de Onboarding
- Instância por cliente derivada de template (`provision_onboarding_instance`).
- Tarefas com status `pending` → `review` → `done`. Conclusão atualiza status geral.
- Progresso calculado: tarefas done / total. Notificação ao concluir (insert em `notifications`).

## Feed de Avisos
- UI em `NotificationsFeed` (cards finos, timestamp XS, marcar como lida).
- Eventos gerados nos módulos (tarefa concluída, pagamento confirmado, reunião, post aprovado, boleto emitido) chamam `notify_event` ou insert direto em `notifications`.
