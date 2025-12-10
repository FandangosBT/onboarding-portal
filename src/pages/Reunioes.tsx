import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Slot = {
  id: string;
  title: string | null;
  starts_at: string;
  ends_at: string;
  status: 'available' | 'booked';
};

export function Reunioes() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('meeting_slots')
      .select('id,title,starts_at,ends_at,status')
      .order('starts_at', { ascending: true })
      .then(({ data }) => {
        setSlots(data ?? []);
        setLoading(false);
      });
  }, []);

  const book = async (id: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    await supabase.from('meeting_slots').update({ status: 'booked', booked_by: userId }).eq('id', id);
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'booked' } : s)));
  };

  if (loading) return <div className="ds-card">Carregando reuniões...</div>;

  return (
    <div className="ds-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
        <h3 style={{ margin: 0 }}>Reuniões</h3>
      </div>
      <div className="ds-grid">
        {slots.map((slot) => (
          <article
            key={slot.id}
            className="ds-card"
            style={{
              padding: 12,
              background: slot.status === 'booked' ? 'rgba(237,224,159,0.08)' : 'var(--color-surface)',
            }}
          >
            <h4 style={{ margin: 0 }}>{slot.title ?? 'Slot de reunião'}</h4>
            <p style={{ margin: '6px 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
              {new Date(slot.starts_at).toLocaleString()} → {new Date(slot.ends_at).toLocaleTimeString()}
            </p>
            <Status status={slot.status} />
            {slot.status === 'available' && (
              <button
                className="ds-button-primary"
                style={{ marginTop: 8, padding: '6px 10px' }}
                aria-label="Reservar reunião"
                onClick={() => book(slot.id)}
              >
                Reservar
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Status({ status }: { status: Slot['status'] }) {
  const color = status === 'available' ? 'var(--color-status-info)' : 'var(--color-brand-gold)';
  const label = status === 'available' ? 'Disponível' : 'Reservado';
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
