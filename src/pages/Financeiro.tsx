import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

type Invoice = {
  id: string;
  description: string | null;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
};

export function Financeiro() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchPage = async () => {
      if (!isSupabaseConfigured) {
        setItems([]);
        setLoading(false);
        return;
      }
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data } = await supabase
        .from('invoices')
        .select('id,description,amount,due_date,status')
        .order('due_date', { ascending: true })
        .range(from, to);
      setItems((prev) => (page === 0 ? data ?? [] : [...prev, ...(data ?? [])]));
      setLoading(false);
    };
    fetchPage();
  }, [page]);

  const confirmPayment = async (id: string) => {
    if (!isSupabaseConfigured) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const actor = sessionData.session?.user?.id;
    await supabase.from('invoices').update({ status: 'paid', updated_by: actor }).eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'paid' } : i)));
  };

  if (loading) return <div className="ds-card">Carregando financeiro...</div>;

  return (
    <div className="ds-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
        <h3 style={{ margin: 0 }}>Boletos</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((inv) => (
          <article key={inv.id} className="ds-card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{inv.description ?? 'Cobrança'}</div>
                <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                  Vencimento: {inv.due_date}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-brand-gold)' }}>
                  R$ {inv.amount.toFixed(2)}
                </div>
                <StatusPill status={inv.status} />
              </div>
            </div>
            {inv.status !== 'paid' && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="ds-button-primary" style={{ padding: '6px 10px' }} aria-label="Confirmar pagamento" onClick={() => confirmPayment(inv.id)}>
                  Confirmar pagamento
                </button>
                <button
                  className="ds-button-primary"
                  style={{ padding: '6px 10px' }}
                  aria-label="Enviar comprovante"
                  onClick={() => alert('Upload de comprovante pendente')}
                >
                  Enviar comprovante
                </button>
              </div>
            )}
          </article>
        ))}
        {items.length >= pageSize * (page + 1) && (
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => setPage((p) => p + 1)}>
            Carregar mais
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Invoice['status'] }) {
  const label = status === 'pending' ? 'Em aberto' : status === 'paid' ? 'Pago' : 'Em atraso';
  const color =
    status === 'pending'
      ? 'var(--color-brand-gold)'
      : status === 'paid'
      ? 'var(--color-status-success)'
      : 'var(--color-status-error)';
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
