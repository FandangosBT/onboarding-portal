# Fases 2 a 4 — Operação Completa, Marketing e Refinamento

## Schema a aplicar
- `supabase/schema.phase2.sql` após `schema.sql` e `schema.core_phase1.sql`.
- Inclui: invoices/receipts, meeting_slots, leads/lead_activities, posts (calendário) com RLS e triggers de notificações.

## Financeiro (RF-030–RF-034)
- Tabela `invoices` com status enum `pending|paid|overdue`, boleto PDF opcional, número interno.
- Recebimento de comprovante via `payment_receipts` (storage_path privado).
- Notificação automática quando status muda para `paid`.
- UI: listagem com pill de status, ação de upload/confirmar pagamento (admin/owner).

## Reuniões (RF-060–RF-064)
- Slots em `meeting_slots` com status `available|booked`.
- Reserva muda status para `booked` e dispara notificação para ambos.
- Histórico mantendo registros passados; `created_by` (staff) e `booked_by` (cliente).

## CRM (RF-050–RF-053)
- Leads com etapas `novo→contatado→proposta→ganho→perdido`.
- Atividades em `lead_activities` (notas, ligações) relacionadas ao lead.
- Acesso de leitura para cliente; criação/edição para staff/admin.

## Calendário de Postagens (RF-040–RF-044)
- Posts em `posts` com status `draft→approved→published`, campos de mídia (`media_path`), legenda, canal.
- Notificação ao aprovar/publicar via trigger.
- Arquivamento: usar `archived_at` e `archive_location`.

## Fase 4 — Refinamento/Admin
- Painel admin: gerenciar termos, templates de onboarding, pipelines, usuários (alavancar policies já criadas).
- Automação via Edge Functions: lembretes de vencimento, tarefas atrasadas, limpeza/arquivamento de mídia.
- Backup manual de mídia: usar Storage path `org/{ano}/{mes}/` e exportar para Google Drive conforme rotina operacional.
