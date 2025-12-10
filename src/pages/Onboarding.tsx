import { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { calculateProgress } from '../lib/onboarding';
import { OnboardingTask } from '../types';
import '../styles/calendar.css';

type Step = { id: string; title: string; position: number };
type TemplateTask = { title: string; description?: string | null };
type TemplateStep = { title: string; tasks: TemplateTask[] };
type Template = { id: string; name: string; description: string; steps: TemplateStep[] };

const TEMPLATES: Template[] = [
  {
    id: 'trafego-q7',
    name: 'Tráfego Pago - Q7 (geral)',
    description: 'Checklist completo para novos clientes de tráfego, do setup ao primeiro mês.',
    steps: [
      {
        title: 'Informações básicas',
        tasks: [
          { title: 'Razão Social' },
          { title: 'CNPJ' },
          { title: 'Segmento' },
          { title: 'Ticket médio' },
          { title: 'Objetivo (ex.: captar pacientes novos)' },
          { title: 'Orçamento diário' },
        ],
      },
      {
        title: 'Plataformas',
        tasks: [
          { title: 'Meta Ads - criar Gerenciador de Negócios' },
          { title: 'Meta Ads - criar Página Facebook' },
          { title: 'Meta Ads - criar perfis Facebook/Instagram do cliente' },
          { title: 'Google Ads - criar ID da conta' },
          { title: 'Google Meu Negócio - revisar ou criar' },
          { title: 'TikTok - confirmar perfil' },
          { title: 'WhatsApp Business - configurar conta e número' },
          { title: 'Site / Landing Page - definir ou criar' },
        ],
      },
      {
        title: 'Auditoria inicial',
        tasks: [
          { title: 'Métricas anteriores (impulsionar/ads) - levantar histórico' },
          { title: 'Posicionamento atual - canais ativos (site, blog, insta, tiktok, fb, newsletter)' },
          { title: 'Concorrentes diretos e referências' },
          { title: 'Diferenciais da oferta (acolhimento, hipnoterapia, psicanálise etc.)' },
        ],
      },
      {
        title: 'Produção criativa',
        tasks: [
          { title: 'Identidade visual - logo/cores/fontes aprovados' },
          { title: 'Fotos/Vídeos - solicitar e organizar sugestões' },
          { title: 'Dores, objeções e desejos do cliente-alvo' },
          { title: 'Pauta inicial - 6 a 12 criativos' },
          { title: 'Planejamento semanal de conteúdo' },
          { title: 'Scripts e âncoras de CTA' },
          { title: 'Edição de conteúdo - definir padrão' },
        ],
      },
      {
        title: 'Configuração inicial',
        tasks: [
          { title: 'Pixel e eventos configurados' },
          { title: 'Campanhas iniciais (3 campanhas x 3 criativos)' },
          { title: 'Acompanhar métricas iniciais' },
          { title: 'Acesso Portal Q7 - CRM' },
          { title: 'Acesso Portal Q7 - Controle Financeiro' },
          { title: 'Acesso Portal Q7 - Gestão de conteúdos (planejamento semanal + repositório de criativos)' },
          { title: 'Acesso Portal Q7 - Mural de Avisos' },
          { title: 'Acesso Portal Q7 - Relatório Semanal' },
          { title: 'Acesso Portal Q7 - Calendário de Reuniões' },
        ],
      },
      {
        title: 'Lançamento',
        tasks: [
          { title: 'Prévia das campanhas aprovada' },
          { title: 'Teste de fluxos / jornada' },
          { title: 'Acompanhamento de métricas pós-lançamento' },
        ],
      },
      {
        title: 'Primeira semana',
        tasks: [
          { title: 'Monitorar métricas (CPC, CPM, CTR)' },
          { title: 'Ajuste de orçamento' },
          { title: 'Testar criativos' },
        ],
      },
      {
        title: 'Relatórios',
        tasks: [
          { title: 'Relatório semanal' },
          { title: 'Reunião de alinhamento (quinzenal)' },
          { title: 'Relatório do mês' },
        ],
      },
    ],
  },
  {
    id: 'trafego-chris',
    name: 'Tráfego Pago - Chris (psicanálise)',
    description: 'Template focado em clínica de psicanálise, com recorte de dores/objeções.',
    steps: [
      {
        title: 'Informações básicas (Chris)',
        tasks: [
          { title: 'Segmento: Psicanálise / Terapia' },
          { title: 'Ticket médio: 200-300 por consulta' },
          { title: 'Objetivo: captar pacientes novos' },
          { title: 'Orçamento / dia: R$20' },
        ],
      },
      {
        title: 'Plataformas (Chris)',
        tasks: [
          { title: 'Meta Ads - criar BM, Página FB, perfis @psi.chrislaine' },
          { title: 'Google Ads - criar ID da conta' },
          { title: 'Google Meu Negócio - revisar' },
          { title: 'TikTok - perfil @psicanalista.chris' },
          { title: 'WhatsApp Business - validar número' },
          { title: 'Site / Landing Page - escopo e prazo' },
        ],
      },
      {
        title: 'Auditoria inicial (Chris)',
        tasks: [
          { title: 'Histórico de campanhas impulsionar/ads' },
          { title: 'Posicionamento atual: Insta, TikTok, Facebook ativos; site/blog a criar' },
          { title: 'Concorrentes diretos e inspirações (Eduardo Molina, Nara Estrela, Sílvia Barros)' },
          { title: 'Diferenciais: acolhimento, hipnoterapia, psicanálise' },
        ],
      },
      {
        title: 'Produção criativa (Chris)',
        tasks: [
          { title: 'Identidade visual: logo/cores (verde oliva/rosa/branco) e fontes mistas' },
          { title: 'Fotos/Vídeos: solicitar sugestões para Chris' },
          { title: 'Dores/objeções: relacionamento amoroso, ansiedade, luto; objeção de iniciar terapia' },
          { title: 'Desejo: estar bem sem pagar mais por isso' },
          { title: 'Pauta inicial: 6 a 12 criativos + planejamento semanal' },
          { title: 'Scripts e CTAs reflexivos' },
          { title: 'Edição de conteúdo com tom acolhedor' },
        ],
      },
      {
        title: 'Configuração inicial (Chris)',
        tasks: [
          { title: 'Pixel e eventos configurados' },
          { title: 'Campanhas iniciais (3 campanhas x 3 criativos) focadas em captação de pacientes' },
          { title: 'Acompanhar métricas iniciais' },
          { title: 'Portal Q7 - Gestão de conteúdo e calendário de reuniões' },
        ],
      },
      {
        title: 'Lançamento e 1ª semana (Chris)',
        tasks: [
          { title: 'Prévia das campanhas e testes de fluxo' },
          { title: 'Monitorar CPC, CPM, CTR e ajustar orçamento' },
          { title: 'Testar criativos (gancho “Psicanálise ≠ Psicologia?”)' },
        ],
      },
      {
        title: 'Relatórios (Chris)',
        tasks: [
          { title: 'Relatório semanal' },
          { title: 'Reunião quinzenal de alinhamento' },
          { title: 'Relatório mensal' },
        ],
      },
    ],
  },
];

const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const normalize = (t: string) => t.trim().toLowerCase();
const LOCAL_KEY = 'onboarding-local-checklist';
const cloneTemplate = (tpl: Template): Template => ({
  id: tpl.id,
  name: tpl.name,
  description: tpl.description,
  steps: tpl.steps.map((s) => ({
    title: s.title,
    tasks: s.tasks.map((t) => ({ title: t.title, description: t.description ?? null })),
  })),
});

function buildSynthetic(template: Template) {
  const syntheticSteps = template.steps.map((s, idx) => ({ id: `local-${template.id}-${idx}`, title: s.title, position: idx + 1 }));
  const syntheticTasks = template.steps.flatMap((s, sIdx) =>
    s.tasks.map((t, tIdx) => ({
      id: `local-${template.id}-${sIdx}-${tIdx}`,
      title: t.title,
      description: t.description ?? null,
      status: 'pending' as OnboardingTask['status'],
      due_date: null,
      step_id: syntheticSteps[sIdx].id,
    }))
  );
  return { syntheticSteps, syntheticTasks };
}

function loadLocalFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as { steps: Step[]; tasks: OnboardingTask[] };
  } catch {
    return null;
  }
}

function saveLocalState(steps: Step[], tasks: OnboardingTask[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ steps, tasks }));
  } catch {
    // ignore
  }
}

export function Onboarding() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('trafego-q7');
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState<Template>(cloneTemplate(TEMPLATES[0]));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const role = (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role;
      setIsAdmin(role === 'internal_admin' || role === 'internal_staff');
    });

    const fetchData = async () => {
      if (!isSupabaseConfigured) {
        const local = loadLocalFallback();
        if (local) {
          setSteps(local.steps);
          setTasks(local.tasks);
        } else {
          const template = TEMPLATES.find((t) => t.id === selectedTemplate) ?? TEMPLATES[0];
          const { syntheticSteps, syntheticTasks } = buildSynthetic(template);
          setDraftTemplate(cloneTemplate(template));
          setSteps(syntheticSteps);
          setTasks(syntheticTasks);
          saveLocalState(syntheticSteps, syntheticTasks);
        }
        setLoading(false);
        return;
      }
      const { data: tasksData } = await supabase
        .from('onboarding_tasks')
        .select('id,title,description,status,due_date,step_id')
        .order('due_date', { ascending: true });
      const { data: stepsData } = await supabase
        .from('onboarding_steps')
        .select('id,title,position')
        .order('position', { ascending: true });
      const hasData = (stepsData ?? []).length > 0 || (tasksData ?? []).length > 0;
      if (!hasData) {
        const template = TEMPLATES.find((t) => t.id === selectedTemplate) ?? TEMPLATES[0];
        const { syntheticSteps, syntheticTasks } = buildSynthetic(template);
        setSteps(syntheticSteps);
        setTasks(syntheticTasks);
        saveLocalState(syntheticSteps, syntheticTasks);
      } else {
        setTasks(tasksData ?? []);
        setSteps(stepsData ?? []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const progress = useMemo(() => {
    return calculateProgress(tasks);
  }, [tasks]);

  const applyTemplate = async (templateId: string) => {
    const baseTemplate = TEMPLATES.find((t) => t.id === templateId);
    const template = draftTemplate && draftTemplate.id === templateId ? draftTemplate : baseTemplate;
    if (!template) return;
    setPublishing(true);
    setFeedback(null);

    // Sem Supabase configurado: aplica localmente para visualização
    if (!isSupabaseConfigured) {
      const { syntheticSteps, syntheticTasks } = buildSynthetic(template);
      setSteps(syntheticSteps);
      setTasks(syntheticTasks);
      setDraftTemplate(cloneTemplate(template));
      saveLocalState(syntheticSteps, syntheticTasks);
      setPublishing(false);
      setFeedback('Template aplicado localmente. Configure Supabase para publicar para os clientes.');
      return;
    }

    // Com Supabase: publica para a organização via RPC
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    const orgId = (user?.app_metadata as any)?.organization_id || (user?.user_metadata as any)?.organization_id;
    if (!orgId) {
      setPublishing(false);
      setFeedback('Usuário sem organization_id. Atualize o metadata antes de publicar.');
      return;
    }

    // Garante template no banco e obtém o uuid
    const { data: tplRow, error: tplError } = await supabase
      .from('onboarding_templates')
      .upsert({ name: template.name, is_active: true }, { onConflict: 'name' })
      .select('id')
      .single();
    if (tplError || !tplRow?.id) {
      setPublishing(false);
      setFeedback('Erro ao registrar template no Supabase.');
      return;
    }

    const { error: rpcError } = await supabase.rpc('publish_onboarding_template', {
      p_org: orgId,
      p_template: tplRow.id,
      p_actor: user?.id,
    });
    if (rpcError) {
      setPublishing(false);
      setFeedback('Erro ao publicar template via RPC. Verifique permissões/RLS.');
      return;
    }

    const { data: tasksData } = await supabase
      .from('onboarding_tasks')
      .select('id,title,description,status,due_date,step_id')
      .order('due_date', { ascending: true });
    const { data: stepsData } = await supabase.from('onboarding_steps').select('id,title,position').order('position', { ascending: true });

    setTasks(tasksData ?? []);
    setSteps(stepsData ?? []);
    setPublishing(false);
    setFeedback('Template publicado. Clientes já podem visualizar o checklist atualizado.');
    saveLocalState(stepsData ?? [], tasksData ?? []);
  };

  const markStatus = async (taskId: string, status: OnboardingTask['status']) => {
    // Evita chamadas inválidas para tarefas sintéticas (ids locais) ou ambiente sem Supabase
    if (taskId.startsWith('local-') || !isSupabaseConfigured) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
      saveLocalState(steps, tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
      return;
    }
    const { error } = await supabase.from('onboarding_tasks').update({ status }).eq('id', taskId);
    if (error) {
      setFeedback('Erro ao salvar status. Verifique permissões/RLS.');
      return;
    }
    const nextTasks = tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setTasks(nextTasks);
    saveLocalState(steps, nextTasks);

    if (status === 'done') {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      const orgId =
        (user?.app_metadata as any)?.organization_id || (user?.user_metadata as any)?.organization_id;
      if (orgId) {
        await supabase.from('notifications').insert({
          organization_id: orgId,
          type: 'task_completed',
          title: 'Tarefa concluída',
          body: 'Uma tarefa do onboarding foi finalizada.',
          origin: 'onboarding',
          actor_id: user?.id,
          recipient_id: null,
        });
      }
    }
  };

  const updateTaskField = (taskId: string, field: keyof OnboardingTask, value: any) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)));
  };

  const saveTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (!isSupabaseConfigured) {
      setFeedback('Checklist salvo localmente. Configure o Supabase para persistir.');
      saveLocalState(steps, tasks);
      return;
    }
    const { title, description, due_date } = task;
    const { error } = await supabase.from('onboarding_tasks').update({ title, description, due_date }).eq('id', taskId);
    if (error) {
      setFeedback('Erro ao salvar alterações. Verifique permissões/RLS.');
    } else {
      setFeedback('Alterações salvas.');
      saveLocalState(steps, tasks);
    }
  };

  if (loading) return <div className="ds-card">Carregando checklist...</div>;

  return (
    <div className="ds-card" style={{ padding: 16 }}>
      {isAdmin && (
        <div className="calendar-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
            <div>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', letterSpacing: 0.6 }}>Templates de onboarding</p>
              <h4 style={{ margin: 0 }}>Publicar checklist para clientes</h4>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <select className="ds-field" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                {TEMPLATES.find((t) => t.id === selectedTemplate)?.description}
              </p>
            </div>
            <button className="ds-button-primary" disabled={publishing} onClick={() => applyTemplate(selectedTemplate)} style={{ justifySelf: 'flex-end' }}>
              {publishing ? 'Publicando...' : 'Publicar template'}
            </button>
          </div>
          {feedback && (
            <p
              style={{
                margin: '8px 0 0',
                color: feedback.toLowerCase().includes('erro') ? 'var(--color-status-error)' : 'var(--color-status-success)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              {feedback}
            </p>
          )}

          <div className="calendar-divider" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: 'var(--color-brand-gold)' }}>✎</span>
            <h5 style={{ margin: 0 }}>Editar template antes de publicar</h5>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflow: 'auto' }}>
            {draftTemplate.steps.map((step, sIdx) => (
              <div key={sIdx} className="calendar-card" style={{ padding: 10 }}>
                <input
                  className="ds-field"
                  value={step.title}
                  onChange={(e) => {
                    const next = cloneTemplate(draftTemplate);
                    next.steps[sIdx].title = e.target.value;
                    setDraftTemplate(next);
                  }}
                  style={{ marginBottom: 6 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {step.tasks.map((task, tIdx) => (
                    <div key={tIdx} className="calendar-section">
                      <input
                        className="ds-field"
                        value={task.title}
                        onChange={(e) => {
                          const next = cloneTemplate(draftTemplate);
                          next.steps[sIdx].tasks[tIdx].title = e.target.value;
                          setDraftTemplate(next);
                        }}
                        placeholder="Título da tarefa"
                      />
                      <textarea
                        className="ds-field"
                        value={task.description ?? ''}
                        onChange={(e) => {
                          const next = cloneTemplate(draftTemplate);
                          next.steps[sIdx].tasks[tIdx].description = e.target.value;
                          setDraftTemplate(next);
                        }}
                        placeholder="Descrição"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--color-brand-gold)' }}>▣</span>
          <h3 style={{ margin: 0 }}>Checklist de Onboarding</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAdmin && (
            <button className="ds-button-primary" style={{ padding: '8px 12px' }} onClick={() => setIsEditing((v) => !v)}>
              {isEditing ? 'Sair do modo edição' : 'Editar checklist'}
            </button>
          )}
          <div style={{ width: 200 }}>
            <div className="ds-progress-track">
              <div className="ds-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {progress}% concluído
            </p>
          </div>
        </div>
      </header>

      {steps.map((step) => (
        <section key={step.id} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: 'var(--color-brand-gold)' }}>◼</span>
            <strong style={{ fontFamily: 'var(--font-family-heading)' }}>{step.title}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.filter((t) => t.step_id === step.id).map((task) => (
              <article
                key={task.id}
                className="ds-card"
                style={{
                  padding: '12px',
                  background: task.status === 'done' ? 'rgba(237,224,159,0.08)' : 'var(--color-surface)',
                  borderColor: task.status === 'review' ? 'var(--color-brand-gold-opacity)' : 'var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {isEditing ? (
                      <>
                        <input
                          className="ds-field"
                          value={task.title}
                          onChange={(e) => updateTaskField(task.id, 'title', e.target.value)}
                          placeholder="Título da tarefa"
                        />
                        <textarea
                          className="ds-field"
                          value={task.description ?? ''}
                          onChange={(e) => updateTaskField(task.id, 'description', e.target.value)}
                          placeholder="Descrição"
                          rows={2}
                        />
                        <input
                          className="ds-field"
                          type="date"
                          value={task.due_date ?? ''}
                          onChange={(e) => updateTaskField(task.id, 'due_date', e.target.value || null)}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => saveTask(task.id)}>
                            Salvar
                          </button>
                          <StatusPill status={task.status} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        {task.description && (
                          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                            {task.description}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {task.status !== 'review' && (
                        <button
                          className="ds-button-primary"
                          style={{ padding: '6px 10px' }}
                          aria-label="Enviar para revisão"
                          onClick={() => markStatus(task.id, 'review')}
                        >
                          Em revisão
                        </button>
                      )}
                      {task.status !== 'done' && (
                        <button
                          className="ds-button-primary"
                          style={{ padding: '6px 10px' }}
                          aria-label="Marcar tarefa como concluída"
                          onClick={() => markStatus(task.id, 'done')}
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {!isEditing && (
                  <footer style={{ marginTop: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <StatusPill status={task.status} />
                    {task.due_date && (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                        Prazo: {task.due_date}
                      </span>
                    )}
                  </footer>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: OnboardingTask['status'] }) {
  const label = status === 'pending' ? 'Pendente' : status === 'review' ? 'Em revisão' : 'Concluída';
  const color =
    status === 'pending' ? 'var(--color-status-warning)' : status === 'review' ? 'var(--color-brand-gold)' : 'var(--color-status-success)';
  return (
    <span
      style={{
        border: `1px solid ${color}`,
        color,
        borderRadius: 999,
        padding: '4px 8px',
        fontSize: 'var(--font-size-xs)',
      }}
    >
      {label}
    </span>
  );
}
