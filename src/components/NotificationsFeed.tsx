import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  origin: string | null;
  created_at: string;
  read_at?: string | null;
};

type Props = {
  mode?: 'all' | 'unread';
};

export function NotificationsFeed({ mode = 'all' }: Props) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [receipts, setReceipts] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const LOCAL_READ_KEY = 'notifications-read';

  const mapFromNotifications = (list: Notification[]) => {
    const map: Record<string, string> = {};
    list.forEach((n) => {
      if (n.read_at) map[n.id] = n.read_at;
    });
    return map;
  };

  useEffect(() => {
    let cancelled = false;
    const readLocal = (uid: string | null) => {
      if (!uid) return {};
      try {
        const raw = localStorage.getItem(LOCAL_READ_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, Record<string, string | null>>;
        const stored = parsed[uid] || {};
        const cleaned: Record<string, string> = {};
        Object.entries(stored).forEach(([key, value]) => {
          if (value) cleaned[key] = value;
        });
        return cleaned;
      } catch (e) {
        console.warn('Erro ao ler cache local de notificações', e);
        return {};
      }
    };

    const fetchAll = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;
      const role = (user?.app_metadata as any)?.role || (user?.user_metadata as any)?.role;
      const uid = user?.id ?? null;
      setIsAdmin(role === 'internal_admin' || role === 'internal_staff');
      setUserId(uid);

      const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      const list = (notifData as Notification[]) ?? [];
      const mergedReceipts = { ...mapFromNotifications(list), ...readLocal(uid) };
      if (cancelled) return;
      setReceipts(mergedReceipts);
      setItems(list.map((n) => ({ ...n, read_at: mergedReceipts[n.id] ?? n.read_at ?? null })));
      setLoading(false);
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const readState = useMemo(() => {
    const map: Record<string, true> = {};
    Object.entries(receipts).forEach(([id, value]) => {
      if (value) map[id] = true;
    });
    items.forEach((n) => {
      if (n.read_at) map[n.id] = true;
    });
    return map;
  }, [items, receipts]);

  const visibleItems = useMemo(() => {
    if (mode !== 'unread') return items;
    return items.filter((n) => !readState[n.id]);
  }, [items, mode, readState]);

  const markAsRead = async (id: string) => {
    const now = new Date().toISOString();
    setReceipts((prev) => ({ ...prev, [id]: now }));
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: now } : n)));
    const uid = userId ?? (await supabase.auth.getSession()).data.session?.user?.id ?? null;
    if (uid) {
      try {
        const raw = localStorage.getItem(LOCAL_READ_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, string | null>>) : {};
        parsed[uid] = { ...(parsed[uid] || {}), [id]: now };
        localStorage.setItem(LOCAL_READ_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.warn('Erro ao salvar cache local de notificações', e);
      }
    }

    await supabase.from('notifications').update({ read_at: now }).eq('id', id);
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
    const pending = items.filter((n) => !readState[n.id]);
    if (!pending.length) return;
    const now = new Date().toISOString();
    const map: Record<string, string> = {};
    pending.forEach((n) => {
      map[n.id] = now;
    });
    setReceipts((prev) => ({ ...prev, ...map }));
    setItems((prev) => prev.map((n) => (map[n.id] ? { ...n, read_at: now } : n)));
    const uid = userId ?? (await supabase.auth.getSession()).data.session?.user?.id ?? null;
    if (uid) {
      try {
        const raw = localStorage.getItem(LOCAL_READ_KEY);
        const parsed = raw ? (JSON.parse(raw) as Record<string, Record<string, string | null>>) : {};
        parsed[uid] = { ...(parsed[uid] || {}), ...map };
        localStorage.setItem(LOCAL_READ_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.warn('Erro ao salvar cache local de notificações', e);
      }
    }

    const ids = pending.map((n) => n.id);
    await supabase.from('notifications').update({ read_at: now }).in('id', ids);
  };

  if (loading) return <div className="ds-card">Carregando notificações...</div>;

  return (
    <div className="ds-card" style={{ padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
          <h3 style={{ margin: 0 }}>Avisos</h3>
        </div>
        <button className="ds-button-primary" style={{ padding: '6px 12px' }} onClick={markAllAsRead} disabled={!visibleItems.length}>
          Marcar todos como lido
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleItems.length === 0 && <p style={{ margin: 0 }}>Nenhuma notificação.</p>}
        {visibleItems.map((n) => {
          const isRead = Boolean(readState[n.id]);
          return (
            <article
            key={n.id}
            className="ds-card"
            style={{
              padding: '12px',
              background: isRead ? 'var(--color-surface)' : 'rgba(237,224,159,0.08)',
              borderColor: isRead ? 'var(--color-border)' : 'var(--color-brand-gold-opacity)',
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
              {!isRead && (
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
        );
        })}
      </div>
    </div>
  );
}
