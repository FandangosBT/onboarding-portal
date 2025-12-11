import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  origin: string | null;
  created_at: string;
};

type Receipt = {
  notification_id: string;
  read_at: string | null;
};

export function NotificationsFeed() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [receipts, setReceipts] = useState<Record<string, string | null>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const role = (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role;
      setIsAdmin(role === 'internal_admin' || role === 'internal_staff');
      setUserId(data.user?.id ?? null);
    });

    const fetchAll = async () => {
      const [{ data: notifData }, { data: receiptsData }] = await Promise.all([
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('notification_receipts').select('notification_id,read_at'),
      ]);
      if (notifData) setItems(notifData);
      if (receiptsData) {
        const map: Record<string, string | null> = {};
        receiptsData.forEach((r) => {
          map[r.notification_id] = r.read_at;
        });
        setReceipts(map);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const markAsRead = async (id: string) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('notification_receipts')
      .upsert({ notification_id: id, user_id: userId, read_at: now }, { onConflict: 'notification_id,user_id' });
    if (!error) setReceipts((prev) => ({ ...prev, [id]: now }));
  };

  const deleteNotice = async (id: string) => {
    const ok = window.confirm('Excluir este aviso para todos os usuários?');
    if (!ok) return;
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setItems((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const markAllAsRead = async () => {
    if (!userId || !items.length) return;
    const now = new Date().toISOString();
    const payload = items.map((n) => ({ notification_id: n.id, user_id: userId, read_at: now }));
    const { error } = await supabase.from('notification_receipts').upsert(payload, { onConflict: 'notification_id,user_id' });
    if (!error) {
      const map: Record<string, string | null> = {};
      items.forEach((n) => {
        map[n.id] = now;
      });
      setReceipts(map);
    }
  };

  if (loading) return <div className="ds-card">Carregando notificações...</div>;

  return (
    <div className="ds-card" style={{ padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
          <h3 style={{ margin: 0 }}>Avisos</h3>
        </div>
        <button className="ds-button-primary" style={{ padding: '6px 12px' }} onClick={markAllAsRead} disabled={!items.length}>
          Marcar todos como lido
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.length === 0 && <p style={{ margin: 0 }}>Nenhuma notificação.</p>}
        {items.map((n) => (
          <article
            key={n.id}
            className="ds-card"
            style={{
              padding: '12px',
              background: receipts[n.id] ? 'var(--color-surface)' : 'rgba(237,224,159,0.08)',
              borderColor: receipts[n.id] ? 'var(--color-border)' : 'var(--color-brand-gold-opacity)',
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
              {!receipts[n.id] && (
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
