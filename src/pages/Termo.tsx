import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type Term = { id: string; title: string; body: string; version: number };

export function Termo() {
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('terms')
      .select('id,title,body,version')
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error && error.message) setError(error.message);
        setTerm(data ?? null);
        setLoading(false);
      });
  }, []);

  const handleSign = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user || !term) return;
    const organizationId =
      (user.app_metadata as any)?.organization_id || (user.user_metadata as any)?.organization_id;
    if (!organizationId) {
      setError('Organization ID não encontrado no perfil.');
      return;
    }

    let ip: string | undefined;
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const json = await res.json();
      ip = json.ip;
    } catch (_) {
      ip = undefined;
    }

    const { error } = await supabase.from('term_signatures').insert({
      term_id: term.id,
      organization_id: organizationId,
      user_id: user.id,
      user_name: (user.user_metadata as any)?.name ?? user.email,
      user_email: user.email,
      ip,
      user_agent: navigator.userAgent,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  if (loading) return <div className="ds-card">Carregando termo...</div>;
  if (!term) return <div className="ds-card">Nenhum termo ativo encontrado.</div>;

  return (
    <div className="ds-card" style={{ maxWidth: 720, margin: '40px auto', padding: '24px' }}>
      <h2 style={{ marginBottom: 4 }}>{term.title}</h2>
      <p style={{ marginTop: 0, marginBottom: 16, color: 'var(--color-text-muted)' }}>Versão {term.version}</p>
      <div
        style={{
          background: 'var(--color-background-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          maxHeight: 360,
          overflow: 'auto',
          marginBottom: 16,
          whiteSpace: 'pre-wrap',
        }}
      >
        {term.body}
      </div>
      {error && <p style={{ color: 'var(--color-status-error)' }}>{error}</p>}
      <button className="ds-button-primary" onClick={handleSign} aria-label="Assinar termo">
        Assinar e continuar
      </button>
    </div>
  );
}
