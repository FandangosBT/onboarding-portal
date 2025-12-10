import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Post } from '../../types';

type Props = {
  onCreated: (post: Post) => void;
};

export function QuickCreatePost({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Configure as variáveis do Supabase (.env.local) para criar posts.');
      return;
    }
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const orgId =
      (sessionData.session?.user?.app_metadata as any)?.organization_id || (sessionData.session?.user?.user_metadata as any)?.organization_id;
    if (!orgId) {
      setLoading(false);
      setError('Usuário sem organização. Verifique o metadata ou vínculo na tabela user_organizations.');
      return;
    }
    const payload = {
      title,
      channel: channel || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      topic: topic || null,
      script: script || null,
      status: 'draft',
      organization_id: orgId,
    };
    const { data, error } = await supabase.from('posts').insert(payload).select().single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data) {
      onCreated(data as Post);
      setTitle('');
      setChannel('');
      setScheduledAt('');
      setTopic('');
      setScript('');
    }
  };

  return (
    <div className="calendar-card">
      <h4 style={{ margin: '0 0 8px' }}>Novo post semanal</h4>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
        Use para registrar rapidamente a pauta da semana antes de detalhar no drawer.
      </p>
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input className="ds-field" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="ds-field" placeholder="Canal (ex.: Instagram)" value={channel} onChange={(e) => setChannel(e.target.value)} />
        <input
          className="ds-field"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          aria-label="Data e hora"
        />
        <input className="ds-field" placeholder="Tópico" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <textarea className="ds-field" placeholder="Script sugerido" value={script} onChange={(e) => setScript(e.target.value)} rows={2} />
        <button className="ds-button-primary" type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar post'}
        </button>
        {error && <p style={{ color: 'var(--color-status-error)', margin: 0 }}>{error}</p>}
      </form>
    </div>
  );
}
