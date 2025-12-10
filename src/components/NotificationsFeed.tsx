import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  origin: string | null;
  created_at: string;
  read_at: string | null;
};

export function NotificationsFeed() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const role = (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role;
      setIsAdmin(role === 'internal_admin' || role === 'internal_staff');
    });

    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data);
        setLoading(false);
      });
  }, []);

  const markAsRead = async (id: string) => {
    const target = items.find((n) => n.id === id);
    if (!target || target.read_at) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    }
  };

  const deleteNotice = async (id: string) => {
    const ok = window.confirm('Excluir este aviso para todos os usuários?');
    if (!ok) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setItems((prev) => prev.filter((n) => n.id !== id));
    }
  };

  if (loading) return <div className="ds-card">Carregando notificações...</div>;

  return (
    <div className="ds-card" style={{ padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
        <h3 style={{ margin: 0 }}>Avisos</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.length === 0 && <p style={{ margin: 0 }}>Nenhuma notificação.</p>}
        {items.map((n) => (
          <article
            key={n.id}
            className="ds-card"
            style={{
              padding: '12px',
              background: n.read_at ? 'var(--color-surface)' : 'rgba(237,224,159,0.08)',
              borderColor: n.read_at ? 'var(--color-border)' : 'var(--color-brand-gold-opacity)',
            }}
          >
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--color-brand-gold)' }}>●</span>
                <span style={{ fontFamily: 'var(--font-family-heading)', fontSize: 'var(--font-size-sm)' }}>{n.title}</span>
              </div>
              <time style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                {new Date(n.created_at).toLocaleString()}
              </time>
            </header>
            {n.body && (
              <p style={{ margin: '6px 0 8px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>{n.body}</p>
            )}
            <footer style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {n.origin && (
                <span
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '999px',
                    padding: '4px 8px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {n.origin}
                </span>
              )}
              {!n.read_at && (
                <button className="ds-button-primary" style={{ padding: '6px 12px' }} onClick={() => markAsRead(n.id)}>
                  Marcar como lida
                </button>
              )}
              {isAdmin && (
                <button className="ds-button-primary" style={{ padding: '6px 12px' }} onClick={() => deleteNotice(n.id)}>
                  Excluir
                </button>
              )}
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
