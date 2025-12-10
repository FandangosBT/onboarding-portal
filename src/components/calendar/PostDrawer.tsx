import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Post } from '../../types';
import { PostComment } from '../../types/comment';
import { StatusPill } from './StatusPill';

type Props = {
  post: Post | null;
  onClose: () => void;
  onUpdated: (post: Partial<Post> & { id: string }) => void;
  accessLevel: 'admin' | 'usuario' | 'desconhecido';
  onStatusChange: (id: string, status: Post['status']) => Promise<void> | void;
  onUpload: (id: string) => Promise<void>;
};

export function PostDrawer({ post, onClose, onUpdated, accessLevel, onStatusChange, onUpload }: Props) {
  const [topic, setTopic] = useState(post?.topic ?? '');
  const [script, setScript] = useState(post?.script ?? '');
  const [caption, setCaption] = useState(post?.caption ?? '');
  const [notes, setNotes] = useState(post?.notes ?? '');
  const [scheduledAt, setScheduledAt] = useState(post?.scheduled_at ?? '');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');

  if (!post) return null;

  useEffect(() => {
    setTopic(post.topic ?? '');
    setScript(post.script ?? '');
    setCaption(post.caption ?? '');
    setNotes(post.notes ?? '');
    setScheduledAt(post.scheduled_at ?? '');
  }, [post]);

  useEffect(() => {
    if (!post) return;
    supabase
      .from('post_comments')
      .select('id,post_id,organization_id,user_id,body,created_at')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setComments(data ?? []));
  }, [post?.id]);

  const saveDetails = async () => {
    setLoading(true);
    const payload = { topic, script, caption: caption || null, notes, scheduled_at: scheduledAt || null };
    const { error } = await supabase.from('posts').update(payload).eq('id', post.id);
    setLoading(false);
    if (!error) onUpdated({ id: post.id, ...payload });
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const { data, error } = await supabase.from('post_comments').insert({ post_id: post.id, organization_id: post.organization_id, body: newComment }).select().single();
    if (!error && data) {
      setComments((prev) => [data as PostComment, ...prev]);
      setNewComment('');
    }
  };

  const downloadFile = async (path?: string | null) => {
    if (!path) return;
    const bucket = import.meta.env.VITE_SUPABASE_PRIVATE_BUCKET || 'secure-docs';
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 30);
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const renderActions = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {accessLevel === 'admin' && (
        <>
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => onStatusChange(post.id, 'editing')}>
            Marcar em edição
          </button>
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => onStatusChange(post.id, 'approved')}>
            Disponibilizar editado
          </button>
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => onStatusChange(post.id, 'published')}>
            Publicar
          </button>
        </>
      )}
      {accessLevel !== 'desconhecido' && (
        <>
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => onStatusChange(post.id, 'draft')}>
            Reverter rascunho
          </button>
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => onStatusChange(post.id, 'approved')}>
            Aprovar
          </button>
        </>
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }} onClick={onClose}>
      <div
        className="ds-card"
        style={{
          width: '460px',
          height: '100%',
          overflow: 'auto',
          padding: 20,
          background: 'linear-gradient(180deg, rgba(237,224,159,0.08), rgba(0,0,0,0.6))',
          backdropFilter: 'blur(6px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div>
            <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>Detalhes do post</p>
            <h3 style={{ margin: 0 }}>{post.title}</h3>
          </div>
          <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={onClose}>
            Fechar
          </button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusPill status={post.status} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
            Atualizado: {post.updated_at ? new Date(post.updated_at).toLocaleString() : '—'}
          </span>
        </div>

        <div className="calendar-divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Tema/Tópico</label>
          <input className="ds-field" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema ou tópico" />

          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Script sugerido</label>
          <textarea className="ds-field" value={script} onChange={(e) => setScript(e.target.value)} rows={3} />

          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Legenda + Hashtags sugeridas</label>
          <textarea className="ds-field" value={caption ?? ''} onChange={(e) => setCaption(e.target.value)} rows={3} placeholder="Legenda + hashtags separadas por espaço" />

          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Observações</label>
          <textarea className="ds-field" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Data agendada</label>
          <input
            className="ds-field"
            type="datetime-local"
            value={scheduledAt ? scheduledAt.substring(0, 16) : ''}
            onChange={(e) => setScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Uploads</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <UploadButton label="Enviar vídeo bruto" disabled={accessLevel !== 'usuario'} onUpload={() => onUpload(post.id)} />
            <UploadButton label="Enviar editado" disabled={accessLevel !== 'admin'} onUpload={() => onUpload(post.id)} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {post.raw_video_path && (
              <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => downloadFile(post.raw_video_path)}>
                Baixar bruto
              </button>
            )}
            {post.edited_video_path && (
              <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={() => downloadFile(post.edited_video_path)}>
                Baixar editado
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Status</strong>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>{renderActions()}</div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="ds-button-primary" style={{ padding: '8px 12px' }} onClick={saveDetails} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <strong>Comentários</strong>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <textarea className="ds-field" value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={2} placeholder="Adicionar comentário" />
            <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={addComment}>
              Enviar
            </button>
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {comments.map((c) => (
              <div key={c.id} className="ds-card" style={{ padding: 8 }}>
                <p style={{ margin: 0 }}>{c.body}</p>
                <small style={{ color: 'var(--color-text-muted)' }}>{new Date(c.created_at).toLocaleString()}</small>
              </div>
            ))}
            {!comments.length && <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Sem comentários.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadButton({ label, onUpload, disabled }: { label: string; onUpload: () => void; disabled?: boolean }) {
  return (
    <button className="ds-button-primary" style={{ padding: '6px 10px' }} onClick={onUpload} disabled={disabled}>
      {label}
    </button>
  );
}
