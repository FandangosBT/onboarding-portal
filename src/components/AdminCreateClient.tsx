import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAccessLevel } from '../lib/permissions';

type Props = {
  organizations: { id: string; name: string }[];
};

export function AdminCreateClient({ organizations }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [orgId, setOrgId] = useState('');
  const [role, setRole] = useState<'client_owner' | 'client_user'>('client_owner');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ajusta org padrão quando a lista carregar
  React.useEffect(() => {
    if (!orgId && organizations.length > 0) {
      setOrgId(organizations[0].id);
    }
  }, [organizations, orgId]);

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validação local de acesso
    const { data: userData } = await supabase.auth.getUser();
    const callerRole = (userData.user?.app_metadata as any)?.role || (userData.user?.user_metadata as any)?.role;
    if (getAccessLevel(callerRole) !== 'admin') {
      setMessage('Apenas Admin pode criar clientes.');
      setLoading(false);
      return;
    }

    // Placeholder: chamar edge function com service role para criar usuário e inserir em user_organizations.
    const { data, error } = await supabase.functions.invoke('admin-create-client', {
      body: { email, name, orgId, role, tempPassword: password, forcePasswordChange: true },
    });

    if (error) {
      const detail = (error as any)?.message || (data as any)?.error || 'Falha ao criar cliente';
      setMessage(detail);
    } else {
      setMessage('Cliente criado com senha temporária. O usuário trocará no primeiro login.');
      setEmail('');
      setName('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="ds-card">
      <h3 style={{ marginTop: 0 }}>Criar login de cliente</h3>
      <form onSubmit={createClient} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="ds-field" placeholder="Email do cliente" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="ds-field" placeholder="Nome do cliente" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="ds-field" value={orgId} onChange={(e) => setOrgId(e.target.value)} required aria-label="Organização">
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <select className="ds-field" value={role} onChange={(e) => setRole(e.target.value as any)} aria-label="Papel">
          <option value="client_owner">Client Owner</option>
          <option value="client_user">Client User</option>
        </select>
        <input className="ds-field" placeholder="Senha temporária" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="ds-button-primary" type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar cliente'}
        </button>
      </form>
      {message && <p style={{ marginTop: 8, color: 'var(--color-brand-gold)' }}>{message}</p>}
    </div>
  );
}
