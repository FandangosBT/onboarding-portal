import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAccessLevel } from '../lib/permissions';

type Invite = {
  id: string;
  target_email: string;
  target_role: string;
  organization_id: string;
  status: string;
  result: string | null;
  created_at: string;
};

export function ClientList() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const fetchInvites = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const role = (userData.user?.app_metadata as any)?.role || (userData.user?.user_metadata as any)?.role;
    if (getAccessLevel(role) !== 'admin') {
      setMessage('Apenas Admin pode listar clientes.');
      return;
    }
    const { data, error } = await supabase.from('user_invites').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) setMessage(error.message);
    else setInvites(data ?? []);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const toggleStatus = async (id: string, status: string) => {
    const next = status === 'inactive' ? 'success' : 'inactive';
    const { error } = await supabase.from('user_invites').update({ status: next }).eq('id', id);
    if (!error) setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, status: next } : i)));
  };

  return (
    <div className="ds-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color: 'var(--color-brand-gold)' }}>◆</span>
        <h3 style={{ margin: 0 }}>Clientes criados</h3>
      </div>
      {message && <p style={{ color: 'var(--color-brand-gold)' }}>{message}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {invites.map((inv) => (
          <div key={inv.id} className="ds-card" style={{ padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <strong>{inv.target_email}</strong>
                <p style={{ margin: '4px 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                  Papel: {inv.target_role} | Org: {inv.organization_id}
                </p>
              </div>
              <Status status={inv.status} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => toggleStatus(inv.id, inv.status)}>
                {inv.status === 'inactive' ? 'Reativar' : 'Marcar inativo'}
              </button>
              {inv.result && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Resultado: {inv.result}</span>
              )}
            </div>
          </div>
        ))}
        {!invites.length && <p style={{ margin: 0 }}>Nenhum cliente cadastrado.</p>}
      </div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const color =
    status === 'success'
      ? 'var(--color-status-success)'
      : status === 'inactive'
      ? 'var(--color-text-secondary)'
      : status === 'error'
      ? 'var(--color-status-error)'
      : 'var(--color-brand-gold)';
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
      {status}
    </span>
  );
}
