import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsFeed } from '../components/NotificationsFeed';
import { calculateProgress } from '../lib/onboarding';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { OnboardingTask } from '../types';
import { getAccessLevel } from '../lib/permissions';
import '../styles/dashboard.css';

type Invoice = { id: string; description: string | null; amount: number; due_date: string; status: string };
type Meeting = { id: string; title: string | null; starts_at: string; status: string };
type Lead = { id: string; name: string; stage: string };
type Post = { id: string; title: string; status: string; scheduled_at: string | null };

const fmtDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sem data');
const fmtDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('pt-BR') : 'Sem data');
const fmtMoney = (value?: number) => (typeof value === 'number' ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—');

export function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [nextInvoice, setNextInvoice] = useState<Invoice | null>(null);
  const [nextMeetings, setNextMeetings] = useState<Meeting[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [nextPosts, setNextPosts] = useState<Post[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      const userRole = (user?.app_metadata as any)?.role || (user?.user_metadata as any)?.role || null;
      setRole(userRole);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured) return;
      const [{ data: tasks }, { data: invoice, error: invoiceErr }, { data: meetings }, { data: leads }, { data: posts }] = await Promise.all([
        supabase.from('onboarding_tasks').select('status').limit(200),
        supabase.from('invoices').select('id,description,amount,due_date,status').order('due_date', { ascending: true }).limit(1).maybeSingle(),
        supabase
          .from('meeting_slots')
          .select('id,title,starts_at,status')
          .gt('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(3),
        supabase.from('leads').select('id,name,stage').order('created_at', { ascending: false }).limit(3),
        supabase
          .from('posts')
          .select('id,title,status,scheduled_at')
          .is('archived_at', null)
          .order('scheduled_at', { ascending: true })
          .limit(3),
      ]);
      setProgress(calculateProgress((tasks as OnboardingTask[]) ?? []));
      if (!invoiceErr) setNextInvoice(invoice ?? null);
      setNextMeetings(meetings ?? []);
      setRecentLeads(leads ?? []);
      setNextPosts(posts ?? []);
    };
    fetchData();
  }, []);
  const quickAction = (path: string) => navigate(path);
  return (
    <div className="dash-page">
      <div className="dash-hero">
        <div>
          <div className="eyebrow">Cockpit ERP</div>
          <h3>Painel Unificado</h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Monitoramento em tempo real do onboarding, financeiro e operação de conteúdo.</p>
          <div className="dash-quick-actions" />
          <div className="dash-metrics">
            <div className="dash-metric">
              <span className="dash-sub">Onboarding</span>
              <strong>{progress}%</strong>
            </div>
            <div className="dash-metric">
              <span className="dash-sub">Reuniões</span>
              <strong>{nextMeetings.length || 0}</strong>
            </div>
            <div className="dash-metric">
              <span className="dash-sub">Posts</span>
              <strong>{nextPosts.length || 0}</strong>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {role && <span className="chip">Nível: {getAccessLevel(role as any) === 'admin' ? 'Admin' : 'Usuário'} ({role})</span>}
          <div>
            <span className="dash-sub">Disponibilidade</span>
            <div className="dash-amount">{progress}%</div>
            <p className="dash-sub" style={{ marginTop: 4 }}>
              Onboarding completo
            </p>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <h4>Progresso do onboarding</h4>
            <span className="dash-chip">{progress}%</span>
          </div>
          <div className="dash-progress">
            <div className="dash-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h4>Próximo boleto</h4>
            <span className="dash-chip">{nextInvoice ? nextInvoice.status : '—'}</span>
          </div>
          {nextInvoice ? (
            <>
              <h5 style={{ margin: '0 0 4px' }}>{nextInvoice.description ?? 'Cobrança'}</h5>
              <p className="dash-sub">Vencimento: {fmtDate(nextInvoice.due_date)}</p>
              <div className="dash-amount">{fmtMoney(nextInvoice.amount)}</div>
            </>
          ) : (
            <p className="dash-sub">Nenhum boleto encontrado.</p>
          )}
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h4>Próximas reuniões</h4>
            <span className="dash-chip">{nextMeetings.length || 0}</span>
          </div>
          <div className="dash-list">
            {nextMeetings.map((m) => (
              <div key={m.id} className="dash-list-item">
                <h5>{m.title ?? 'Reunião'}</h5>
                <p className="dash-sub">{fmtDateTime(m.starts_at)}</p>
                <span className="dash-chip">{m.status}</span>
              </div>
            ))}
            {nextMeetings.length === 0 && <p className="dash-sub">Nenhuma reunião futura.</p>}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h4>Leads recentes</h4>
            <span className="dash-chip">{recentLeads.length || 0}</span>
          </div>
          <div className="dash-list">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="dash-list-item">
                <h5>{lead.name}</h5>
                <p className="dash-sub">Etapa: {lead.stage}</p>
              </div>
            ))}
            {recentLeads.length === 0 && <p className="dash-sub">Nenhum lead cadastrado.</p>}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h4>Próximos posts</h4>
            <span className="dash-chip">{nextPosts.length || 0}</span>
          </div>
          <div className="dash-list">
            {nextPosts.map((post) => (
              <div key={post.id} className="dash-list-item">
                <h5>{post.title}</h5>
                <p className="dash-sub">{fmtDateTime(post.scheduled_at)}</p>
                <span className="dash-chip">{post.status}</span>
              </div>
            ))}
            {nextPosts.length === 0 && <p className="dash-sub">Nenhum post agendado.</p>}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <h4>Notificações</h4>
          </div>
          <NotificationsFeed mode="unread" />
        </div>
      </div>
    </div>
  );
}
