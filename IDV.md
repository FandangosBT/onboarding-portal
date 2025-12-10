# 🎨 **Guia de Identidade Visual Aplicada ao PRD — Q7 OPS**

## 1. **Fundamentos da Marca (Resumo Técnico)**

Com base no PDF oficial, a Q7 OPS se caracteriza por:

### **Arquétipos**

* **Criador** → estética inteligente, original, geométrica, funcional.
* **Herói** → coragem, precisão, força visual, contraste dominante.

### **Estética**

* Minimalista, precisa, tecnológica.
* Forte uso do preto como pilar de confiabilidade.
* Dourado chapado como realce estratégico, não decorativo.
* Símbolo geométrico derivado do moinho — movimento, inteligência, transformação.

### **Tipografias**

* **Principal:** *Coder* (títulos, elementos técnicos, headings, labels estruturais).
* **Apoio:** *Area* (corpo de texto, descrições, tabelas, conteúdo funcional).

### **Paleta oficial**

* Preto Q7: **#1A1A1A**
* Dourado chapado: **#EDE09F**

---

# 2. **Sistema de Design Tokens para o Portal**

Esses tokens serão utilizados em *todos os módulos do PRD*, garantindo consistência visual e técnica.

---

## 🎨 **2.1 Tokens de Cores**

```json
{
  "color.background.primary": "#1A1A1A",          // fundo principal
  "color.background.secondary": "#0F0F0F",        // variação para blocos
  "color.surface": "#222222",                     // cartões, listas
  "color.border": "rgba(255,255,255,0.06)",
  
  "color.text.primary": "#FFFFFF",
  "color.text.secondary": "rgba(255,255,255,0.7)",
  "color.text.muted": "rgba(255,255,255,0.45)",

  "color.brand.gold": "#EDE09F",                  // acento e highlights
  "color.brand.gold.opacity": "rgba(237,224,159,0.2)",

  "color.status.success": "#60D394",
  "color.status.warning": "#F4C95D",
  "color.status.error": "#FF6B6B",
  "color.status.info": "#4D9DE0"
}
```

### Aplicações por módulo (PRD)

* **Onboarding** → barras de progresso em `color.brand.gold`.
* **Financeiro** → status pagos/em aberto usam cores de status, nunca dourado.
* **Agenda / CRM** → selecionados e highlights com `brand.gold.opacity`.
* **Cards de dashboard** → sempre fundo escuro com borda translúcida.

---

## 🅰️ **2.2 Tokens Tipográficos**

```json
{
  "font.family.heading": "Coder, sans-serif",
  "font.family.body": "Area, sans-serif",

  "font.size.xl": "32px",
  "font.size.lg": "24px",
  "font.size.md": "18px",
  "font.size.sm": "16px",
  "font.size.xs": "14px",

  "font.weight.bold": 700,
  "font.weight.semibold": 600,
  "font.weight.regular": 400
}
```

### Aplicações por módulo

* **Títulos de páginas:** Coder Bold, 32px.
* **Títulos de cards:** Coder Semibold, 18px.
* **Texto funcional:** Area Regular, 16px.
* **Breadcrumbs / labels:** Area Regular, 14px, cor secundária.

---

## 🧩 **2.3 Tokens de Espaçamento**

```json
{
  "space.xs": "4px",
  "space.sm": "8px",
  "space.md": "16px",
  "space.lg": "24px",
  "space.xl": "40px"
}
```

---

## 🖼 **2.4 Tokens de Raio e Borda**

```json
{
  "radius.sm": "4px",
  "radius.md": "8px",
  "radius.lg": "12px"
}
```

---

## ✨ **2.5 Tokens de Sombra e Elevação**

```json
{
  "shadow.card": "0px 4px 12px rgba(0,0,0,0.25)",
  "shadow.hover": "0px 6px 20px rgba(0,0,0,0.35)"
}
```

---

# 3. **Componentes UI do Portal — com Identidade Q7 OPS**

A seguir apresento os **componentes base** que devem ser usados em todos os módulos do PRD.

---

## 3.1 **Botão Primário (CTA)**

### Visual

* Fundo: preto
* Borda: dourado chapado
* Fonte: *Coder Bold*
* Microinteração: leve expansão + brilho suave no dourado

### JSX (Codex / React-like)

```jsx
<Button
  style={{
    backgroundColor: "var(--color.background.primary)",
    color: "var(--color.brand.gold)",
    border: "1px solid var(--color.brand.gold)",
    padding: "12px 24px",
    borderRadius: "var(--radius.md)",
    fontFamily: "var(--font.family.heading)",
    fontSize: "var(--font.size.sm)",
    transition: "transform .2s ease, box-shadow .2s ease"
  }}
  hover={{
    transform: "scale(1.03)",
    boxShadow: "var(--shadow.hover)"
  }}
>
  Continuar
</Button>
```

---

## 3.2 **Card Base (listas, dashboard, CRM)**

```css
.card {
  background: var(--color.surface);
  border: 1px solid var(--color.border);
  border-radius: var(--radius.md);
  padding: var(--space.md);
  box-shadow: var(--shadow.card);
}
```

> Todos os módulos do PRD usam este card como unidade visual.

---

## 3.3 **Barras de Progresso (Onboarding)**

```css
.progress-track {
  background: rgba(255,255,255,0.1);
  height: 6px;
  border-radius: 6px;
}
.progress-fill {
  background: var(--color.brand.gold);
  height: 6px;
  border-radius: 6px;
  transition: width .3s ease-out;
}
```

---

## 3.4 **Listas (boletos, leads, tarefas)**

* Linha com espaçamento vertical amplo.
* Ícones minimalistas dourado→preto.
* Status sempre em pill com `border: 1px solid #EDE09F`.

---

## 3.5 **Campos de Formulário**

```css
input, textarea, select {
  background: #111;
  border: 1px solid var(--color.border);
  color: var(--color.text.primary);
  padding: 12px;
  border-radius: var(--radius.md);
  font-family: var(--font.family.body);
}
```

---

# 4. **Aplicação da Identidade Visual em Cada Módulo do PRD**

Agora conecto diretamente **PRD → Diretriz Visual** para implementação.

---

## 4.1 **Autenticação & Termo de Adesão**

### Telas devem refletir:

* Estética heroica minimalista
* Preto dominante (#1A1A1A)
* CTA dourado
* Título em *Coder Bold*

### Tela de Termo

* Bloco centralizado
* Fundo escuro, texto em Area Regular
* Assinatura digital destacada com **dourado suave**

---

## 4.2 **Checklist de Onboarding**

### Padrões visuais:

* Etapas em cartões escuros
* Barra dourada indicando progresso
* Tarefas → bullets geométricos inspirados no símbolo do moinho

### Interação

* Transição de “pendente → revisão → concluída” com micro glow dourado.

---

## 4.3 **Financeiro (Boletos)**

### Listagem

* Card minimalista
* Status:

  * Em aberto → pill dourado
  * Pago → pill verde
* Ícones geométricos seguindo estética *Coder*

### Upload de comprovante

* Componente de upload com borda pontilhada dourada.

---

## 4.4 **Calendário de Postagens**

### Visual

* Grade minimalista
* Seleções em `brand.gold.opacity`
* Cards de posts com miniatura em borda dourada fina

### Status das postagens:

* Rascunho → cinza
* Aprovado → dourado
* Publicado → verde

---

## 4.5 **CRM Simplificado**

### Pipeline Kanban

* Colunas com títulos em *Coder*
* Cards com bordas douradas sutis
* Movimentação arrastável com animação suave GSAP

---

## 4.6 **Reuniões**

* Slots disponíveis: borda dourada + hover com glow
* Slots ocupados: superfície escura opaca
* Histórico: layout em lista com marcação cronológica

---

## 4.7 **Feed de Avisos / Notificações**

* Cada notificação é um card fino
* Ícone dourado minimalista
* Timestamp em Area XS com opacidade reduzida

---

## 4.8 **Dashboard Unificado**

### Composição

* Títulos *Coder* grandes
* Cards modulares seguindo layout 3–4 colunas
* Seções:

  * Progresso → barra dourada
  * Financeiro → próximo boleto com pill
  * Leads → lista compacta
  * Posts agendados → miniaturas
  * Reuniões → agenda do dia

---

# 5. **Microinterações Globais**

### Botões

* Hover: escala 1.03 + sombra
* Click: compressão rápida (0.96)

### Cards

* Hover: borda dourada suave (transparência 20%)

### Ícones

* Uso minimalista, geométrico, em **dourado chapado**.

---

# 6. **Acessibilidade & Performance**

* Contraste mínimo WCAG AA (dourado sobre preto supera 7:1).
* Tamanhos mínimos de toque 44px.
* Estados de foco bem definidos (borda dourada intensa).
* Evitar animações pesadas — GSAP com *ease-out*, 120–180ms.

---

# 7. **Conclusão**

Agora o **PRD está completamente integrado à identidade visual oficial da Q7 OPS**.
A partir daqui, posso gerar automaticamente:

### ✔ Sistema completo de componentes (Codex / React)

### ✔ Wireframes em alta fidelidade no estilo Q7 OPS

### ✔ Design System Documentado

### ✔ Biblioteca de tokens para Supabase + Frontend