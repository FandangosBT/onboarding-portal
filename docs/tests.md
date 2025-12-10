# Testes e Qualidade

## Scripts
- `npm test` → Vitest (unitários).
- `npm run dev` → validação manual dos fluxos e acessibilidade visual.

## Cobertura mínima (implementada)
- Regras de permissão de módulos (`src/lib/__tests__/permissions.test.ts`).
- Cálculo de progresso do onboarding (`src/lib/__tests__/onboarding.test.ts`).

## Cobertura recomendada (próximos passos)
- Integração Supabase/RLS via testes de API (mock ou ambiente de staging).
- Triggers de notificações (pagamento, reunião, post aprovado) com as functions do schema.
- E2E (Playwright/Cypress) para fluxos: login+termo, concluir tarefa, confirmar pagamento, aprovar post, reservar reunião.
- Acessibilidade: validar contrastes e foco via axe-core/Storybook.
- Performance: listas grandes (posts/leads) com paginação e carregamento incremental.
