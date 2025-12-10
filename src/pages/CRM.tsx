import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  origin: string | null;
  stage: 'novo' | 'contatado' | 'proposta' | 'ganho' | 'perdido';
  value: number | null;
};

const stages: Lead['stage'][] = ['novo', 'contatado', 'proposta', 'ganho', 'perdido'];

export function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      if (!isSupabaseConfigured) {
        setLeads([]);
        setLoading(false);
        return;
      }
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data } = await supabase
        .from('leads')
        .select('id,name,email,phone,origin,stage,value')
        .order('created_at', { ascending: false })
        .range(from, to);
      setLeads((prev) => (page === 0 ? data ?? [] : [...prev, ...(data ?? [])]));
      setLoading(false);
    };
    fetchLeads();
  }, [page]);

  const move = async (id: string, stage: Lead['stage']) => {
    await supabase.from('leads').update({ stage }).eq('id', id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  if (loading) return <div className="ds-card">Carregando CRM...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
      {stages.map((stage) => (
        <div key={stage} className="ds-card" style={{ minHeight: 160 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: 'var(--color-brand-gold)' }}>▮</span>
            <strong style={{ textTransform: 'capitalize' }}>{stage}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leads
              .filter((l) => l.stage === stage)
              .map((lead) => (
                <article key={lead.id} className="ds-card" style={{ padding: 10 }}>
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  <p style={{ margin: '2px 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                    {lead.email ?? 'sem email'} | {lead.phone ?? 'sem telefone'}
                  </p>
                  <p style={{ margin: '2px 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                    Origem: {lead.origin ?? '-'} | Valor: {lead.value ? `R$ ${lead.value.toFixed(2)}` : '-'}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {stages
                      .filter((s) => s !== stage)
                      .slice(0, 3) // limitar botões
                      .map((s) => (
                        <button
                          key={s}
                          className="ds-button-primary"
                          style={{ padding: '4px 8px' }}
                          aria-label={`Mover lead para ${s}`}
                          onClick={() => move(lead.id, s)}
                        >
                          Mover para {s}
                        </button>
                      ))}
                  </div>
                </article>
              ))}
          </div>
        </div>
      ))}
      {leads.length >= pageSize * (page + 1) && (
        <button className="ds-button-primary" style={{ padding: '6px 10px', marginTop: 12 }} onClick={() => setPage((p) => p + 1)}>
          Carregar mais leads
        </button>
      )}
    </div>
  );
}
