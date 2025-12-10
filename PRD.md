# 📘 **PRD — Portal de Onboarding Integrado**

---

# 1. **Visão Geral do Produto**

O Portal de Onboarding Integrado é um sistema centralizado onde clientes da agência terão acesso a:

* onboarding guiado
* documentos e termos
* controle financeiro
* calendário editorial
* CRM simplificado
* notificações importantes
* reuniões e alinhamentos
* suporte

O portal serve como **ponto único de contato** entre cliente e equipe de operações.

A tecnologia utilizada será:

* **Frontend:** Codex
* **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions)
* **Nenhuma integração externa**, exceto backup manual de mídia para Google Drive.

---

# 2. **Objetivos do Produto**

### **2.1 Objetivos Gerais**

* Reduzir a fricção no início da jornada do cliente.
* Aumentar retenção, satisfação e percepção de valor.
* Minimizar a dependência do WhatsApp e centralizar comunicação.
* Criar previsibilidade operacional para o time interno.
* Facilitar acompanhamento de resultados (CRM + calendário de posts).

### **2.2 Objetivos Específicos**

* Ter um onboarding padronizado, rastreável e com evolução clara.
* Unificar tarefas, reuniões, documentos e pagamentos em um único painel.
* Permitir visualização e aprovação rápida de conteúdos.
* Registrar leads e oportunidades sem depender de ferramentas externas.

---

# 3. **Público-Alvo**

### **Usuários clientes**

* Pequenos e médios empreendedores.
* Gestores que precisam ter visão centralizada e clara dos entregáveis.
* Usuários com baixa familiaridade técnica.

### **Usuários internos da agência**

* Equipe de implementação técnica.
* Designer responsável por posts e páginas.
* Account Manager responsável pelo projeto.
* Suporte técnico de rotina.

---

# 4. **Proposta de Valor**

O portal funciona como um **ClientOS**, uma plataforma que:

* guia o cliente no onboarding,
* centraliza informações financeiras,
* organiza aprovações de conteúdo,
* oferece transparência do trabalho realizado,
* e reforça a autoridade da agência.

É a “casa digital” do cliente dentro da operação.

---

# 5. **Componentes do Sistema (Módulos)**

O sistema é composto por 7 módulos principais:

1. **Autenticação e gestão de usuários**
2. **Termo de adesão (aceite digital)**
3. **Checklist de onboarding**
4. **Financeiro (boletos e pagamentos)**
5. **Calendário de postagens**
6. **CRM simplificado**
7. **Reuniões com equipe**
8. **Feed de avisos / Notificações**
9. **Dashboard unificado**

---

# 6. **Requisitos Funcionais por Módulo**

---

## **6.1 Autenticação e Usuários**

### RF-001

O sistema deve permitir login e cadastro via Supabase Auth (email + senha).

### RF-002

Cada usuário pertence a uma **organização** (empresa do cliente).

### RF-003

Deve existir diferenciação entre papéis:

* `client_owner`
* `client_user`
* `internal_admin`
* `internal_staff`

### RF-004

Regra de vizualização → um usuário só acessa dados da sua organização.

---

## **6.2 Termo de Adesão**

### RF-010

Ao acessar pela primeira vez, o usuário deve visualizar o termo ativo.

### RF-011

O termo deve ser assinado digitalmente com:

* IP
* user_agent
* timestamp
* nome e email do usuário

### RF-012

Sem assinatura, o restante do portal deve permanecer bloqueado.

### RF-013

O administrador pode criar novas versões do termo.

---

## **6.3 Checklist de Onboarding**

### RF-020

Cada cliente deve iniciar com uma instância de onboarding baseada em um template.

### RF-021

O checklist deve ser dividido em **etapas**, cada etapa contendo **tarefas**.

### RF-022

Tarefas podem ser atribuídas ao cliente ou equipe interna.

### RF-023

Cada tarefa deve ter:

* título
* descrição
* responsável
* prazo
* status (pendente, em revisão, concluída)

### RF-024

A conclusão de uma tarefa deve gerar notificação.

### RF-025

Quando todas as tarefas forem concluídas → marcar onboarding como completo.

---

## **6.4 Financeiro (Boletos)**

### RF-030

O sistema deve listar cobranças (invoices) associadas à organização.

### RF-031

Cada cobrança tem:

* valor
* vencimento
* status
* descrição
* número interno
* PDF opcional do boleto

### RF-032

O cliente pode enviar comprovante de pagamento.

### RF-033

Um usuário interno deve confirmar pagamentos manualmente.

### RF-034

Confirmação atualiza o status para “paid” e gera notificação.

---

## **6.5 Calendário de Postagens**

### RF-040

O calendário deve suportar visualizações:

* mensal
* semanal
* lista

### RF-041

Cada postagem contém:

* mídia armazenada no Supabase Storage
* data
* canal
* legenda
* status (rascunho → aprovado → publicado)

### RF-042

O cliente deve poder aprovar ou pedir ajuste.

### RF-043

Quando um conteúdo for aprovado, deve gerar notificação.

### RF-044

Mídias antigas podem ser arquivadas:

* `archived_at`
* `archive_location` (opcional)

---

## **6.6 CRM Simplificado**

### RF-050

O CRM deve registrar leads com:

* nome
* email
* telefone
* origem
* etapa do funil
* valor da oportunidade

### RF-051

Etapas:

* novo
* contatado
* proposta
* ganho
* perdido

### RF-052

O usuário interno deve poder registrar atividades (ligações, notas etc).

### RF-053

O cliente deve visualizar seus leads e atividades.

---

## **6.7 Reuniões**

### RF-060

A equipe interna pode cadastrar **slots de reunião**.

### RF-061

O cliente pode reservar um slot disponível.

### RF-062

Ao reservar, o slot muda para `status = booked`.

### RF-063

Ambos recebem uma notificação de confirmação.

### RF-064

Deve existir histórico de reuniões passadas.

---

## **6.8 Feed de Avisos**

### RF-070

O sistema deve ter um feed cronológico com:

* título
* corpo
* tipo
* data
* usuário criador (se houver)

### RF-071

Notificações são criadas automaticamente por eventos internos:

* tarefa concluída
* pagamento confirmado
* nova reunião
* postagem aprovada
* novo boleto emitido

### RF-072

O usuário pode marcar uma notificação como lida.

---

## **6.9 Dashboard Unificado**

### RF-080

Tela inicial deve mostrar:

* Progresso do onboarding
* Próximo boleto a vencer
* Últimas notificações
* Proximas reuniões
* Leads recentes
* Próximos posts agendados

---

# 7. **Requisitos Não Funcionais**

### RNF-001

A UI deve ser simples, responsiva e minimalista.

### RNF-002

Todo conteúdo do cliente deve ser protegido via RLS do Supabase.

### RNF-003

O sistema deve ter desempenho estável mesmo com:

* 1000+ postagens
* 2000+ leads
* 50+ usuários por organização

### RNF-004

Storage organizado por cliente/ano/mês.

### RNF-005

Armazenamento público para imagens comuns e privado para documentos sensíveis.

---

# 8. **Critérios de Aceite (por módulo)**

### Termo de adesão

* Usuário não acessa nada até assinar o termo → OK
* Assinatura fica registrada no painel admin → OK

### Onboarding

* Etapas e tarefas aparecem ordenadas
* Cliente consegue marcar tarefa como concluída
* Status geral muda automaticamente quando finalizar

### Financeiro

* Cliente enxerga boletos pendentes
* Upload de comprovante funciona
* Admin troca status e notificação aparece

### Calendário

* Upload de mídia funciona
* Cliente aprova/posts → altera status
* Posts arquivados não exibem mídia

### CRM

* Leads podem ser criados, editados e movidos entre colunas
* Histórico funciona

### Reuniões

* Slots disponíveis são listados
* Reserva muda status e notifica

---

# 9. **Roadmap Recomendado**

## **Fase 1 — Core mínimo operacional**

1. Autenticação
2. Termo de adesão
3. Checklist de onboarding
4. Feed de notificações

## **Fase 2 — Operação completa**

5. Financeiro
6. Reuniões
7. CRM

## **Fase 3 — Marketing**

8. Calendário de postagens

## **Fase 4 — Refinamento**

9. Arquivamento de posts antigos
10. Painel de administração avançado
11. Automação interna por Supabase Functions

---

# 10. **Conclusão**

Este PRD define:

* o escopo fechado do sistema,
* os módulos essenciais,
* o comportamento esperado de cada parte,
* e os critérios que determinam quando o produto está pronto para uso em produção.