# Blueprint de Implementação (Checklist) — Portal de Onboarding Integrado

Baseado em PRD, Guia IDV Q7 OPS e padrão UX/UI Awwwards.

## 1) Preparação Técnica e Arquitetura
- [x] Definir stack frontend (Codex/React-like) com roteamento protegido e layout dark padrão; configurar `.env` para Supabase (Auth, Postgres, Storage, Edge Functions).
- [x] Modelar schema Supabase com separação por `organization_id`; ativar RLS por tabela com políticas por papel (`client_owner`, `client_user`, `internal_admin`, `internal_staff`).
- [x] Planejar buckets de Storage (público para mídias comuns; privado para documentos sensíveis) com estrutura `org/{ano}/{mes}/`.
- [x] Configurar notificações internas (tabela feed + triggers/edge functions) acionadas pelos eventos do PRD.
- [x] Mapear rotas e layout base: `/login`, `/termo`, `/onboarding`, `/financeiro`, `/calendario`, `/crm`, `/reunioes`, `/avisos`, `/dashboard`.

## 2) Identidade Visual e Design System (IDV)
- [x] Implementar tokens globais (CSS vars) com paleta oficial: fundo `#1A1A1A`, superfícies `#222222`, bordas translúcidas, dourado `#EDE09F` + `rgba(237,224,159,0.2)`, textos primário/secundário/muted.
- [x] Carregar tipografias Coder (headings, labels) e Area (body); definir escala: 32/24/18/16/14 px com pesos bold/semibold/regular.
- [x] Criar componentes base: botão primário (preto + borda dourada, hover scale 1.03, foco dourado), card escuro com sombra, barras de progresso douradas, campos de formulário dark com radius md.
- [x] Estabelecer grid, espaçamentos (4/8/16/24/40px), raios (4/8/12px) e sombras (card/hover) como tokens.
- [x] Garantir Awwwards-quality: contraste AA, microinterações suaves (hover/focus/click), nenhum arquivo >200 linhas, sem duplicações.

## 3) Segurança, Papéis e Acesso
- [x] Implementar controle de sessão Supabase + guard de rota; bloquear toda navegação sem login.
- [x] Aplicar RLS por organização em todas as tabelas de domínio; validar atributos de papel no JWT.
- [x] Criar middleware de autorização por módulo (admin vs client) e fallback de erro amigável.
- [x] Registrar auditoria mínima (created_by, updated_by, timestamps, ip, user_agent quando requerido).

## 4) Notificações / Feed Global (RF-024, RF-034, RF-043, RF-063, RF-071)
- [x] Definir tabela `notifications` com: id, org, tipo, título, corpo, data, origem, `read_at`, destinatário.
- [x] Implementar triggers/edge functions para gerar avisos em: tarefa concluída, pagamento confirmado, nova reunião, postagem aprovada, novo boleto emitido.
- [x] Criar UI do feed em cards finos com ícone dourado, timestamp em Area XS, ação “marcar como lida”.

## 5) Fase 1 — Core mínimo operacional
- [x] Autenticação (RF-001): login/cadastro email+senha Supabase; fluxo de reset; exibição de papel do usuário; associação a organização.
- [x] Termo de adesão (RF-010–RF-013): tela bloqueante antes do portal; assinatura digital gravando ip, user_agent, timestamp, nome/email; versionamento do termo e histórico; painel admin para publicar novas versões.
- [x] Checklist de Onboarding (RF-020–RF-025): instância por cliente baseada em template; etapas com tarefas contendo título, descrição, responsável, prazo, status; transição pendente→revisão→concluída; barra de progresso dourada; notificação ao concluir tarefa; marcar onboarding como completo ao finalizar todas.
- [x] Feed de avisos (UI) integrado ao layout principal e acessível desde o dashboard.

## 6) Fase 2 — Operação completa
- [x] Financeiro (RF-030–RF-034): listagem de invoices (valor, vencimento, status, descrição, número, PDF opcional); upload de comprovante via Storage privado; ação admin para confirmar pagamento (status paid) gerando notificação; pill de status (em aberto dourado, pago verde).
- [x] Reuniões (RF-060–RF-064): cadastro de slots pela equipe interna; exibição de slots disponíveis/ocupados; reserva pelo cliente muda status para booked; notificação para ambos; histórico de reuniões passadas.
- [x] CRM simplificado (RF-050–RF-053): leads com nome/email/telefone/origem/etapa/valor; pipeline com etapas novo→contatado→proposta→ganho→perdido (drag & drop); registro de atividades (notas/ ligações) por usuário interno; visão cliente de leads e atividades.

## 7) Fase 3 — Marketing
- [x] Calendário de postagens (RF-040–RF-044): visualizações mensal/semanal/lista; posts com mídia no Storage, data, canal, legenda, status rascunho→aprovado→publicado; ação de aprovação/ajuste pelo cliente; notificação ao aprovar; arquivamento de mídias antigas com `archived_at` e `archive_location`; seleções com `brand.gold.opacity`.

## 8) Fase 4 — Refinamento e Admin
- [x] Arquivamento de posts antigos (UI + filtro); painel admin avançado para gerenciar termos, templates de onboarding, pipelines e usuários.
- [x] Automação interna via Edge Functions (ex.: lembretes de vencimento, alertas de tarefas atrasadas, limpeza de mídia arquivada).
- [x] Backup manual de mídia para Google Drive documentado e agendado.

## 9) Dashboard Unificado (RF-080)
- [x] Compor cards em grid escuro (3–4 colunas): progresso do onboarding (barra dourada), próximo boleto, últimas notificações, próximas reuniões, leads recentes, próximos posts.
- [x] Incluir ações rápidas (confirmar pagamento, marcar tarefa, aprovar post, reservar reunião) com microinterações leves.

## 10) UX/Acessibilidade/Performance
- [x] Navegação responsiva (desktop/mobile) com tipografia consistente; tamanhos de toque ≥44px; estados de foco dourados visíveis.
- [x] Semântica ARIA em formulários, listas, botões; contrastes AA+ (dourado sobre preto).
- [x] Lazy-load para listas pesadas (posts, leads); paginação/infinite scroll; cache local para visões recentes.
- [x] Garantir performance para 1000+ posts e 2000+ leads: índices no Postgres por org/status/data; consultas paginadas.

## 11) Testes e Qualidade
- [x] Testes de domínio (unitários) para regras de status e notificações por módulo.
- [ ] Testes de integração Supabase (RLS, triggers) cobrindo papéis e escopos de organização.
- [ ] E2E dos fluxos críticos: login+termo, concluir tarefa, confirmar pagamento, aprovar post, reservar reunião.
- [ ] Checklist Awwwards final: consistência visual Q7 OPS, microinterações suaves, acessibilidade, ausência de duplicação, performance ok.
