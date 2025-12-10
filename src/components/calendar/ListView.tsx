import { canTransition } from '../../lib/calendar';
import { Post } from '../../types';
import { StatusPill } from './StatusPill';

type Props = {
  posts: Post[];
  onStatusChange: (id: string, status: Post['status']) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string) => void;
  onFile: (id: string, file: File | null) => void;
  pageSize: number;
  page: number;
  onNextPage: () => void;
  fileMap: Record<string, File | null>;
  onOpen?: (id: string) => void;
};

function formatDateTime(value: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ListView({ posts, onStatusChange, onArchive, onDelete, onUpload, onFile, pageSize, page, onNextPage, fileMap, onOpen }: Props) {
  const copy = (text: string | null | undefined) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {
      // ignore clipboard errors in unsupported environments
    });
  };

  if (!posts.length) {
    return (
      <div className="calendar-card" style={{ textAlign: 'center', padding: 24 }}>
        <h4 style={{ margin: 0 }}>Nenhum post agendado</h4>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>Use o formulário à direita ou importe um CSV para começar.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {posts.map((post) => (
        <article key={post.id} className="calendar-card" onClick={() => onOpen?.(post.id)} style={{ cursor: onOpen ? 'pointer' : 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'grid', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{post.topic || post.title}</div>
                <StatusPill status={post.status} />
              </div>
              <div className="calendar-meta">
                <span className="calendar-tag">
                  <strong>{weekdayNames[post.weekday ?? -1] || 'Data'}</strong>
                  {formatDateTime(post.scheduled_at)}
                </span>
                {post.channel && <span className="calendar-tag">Canal · {post.channel}</span>}
                {post.week_number && <span className="calendar-tag">Semana · {post.week_number}</span>}
                {post.reference_links && <span className="calendar-tag">Links incluídos</span>}
                {post.archived_at && <span className="calendar-tag">Arquivado</span>}
              </div>
            </div>
          </div>

          <div className="calendar-divider" />

          <div className="calendar-sections">
            {post.script && (
              <div className="calendar-section">
                <div className="section-header">
                  <span>Roteiro / Script sugerido</span>
                  <button className="section-copy" onClick={(e) => { e.stopPropagation(); copy(post.script); }}>
                    Copiar
                  </button>
                </div>
                <div className="section-body">{post.script}</div>
              </div>
            )}
            {post.caption && (
              <div className="calendar-section">
                <div className="section-header">
                  <span>Legenda + Hashtags</span>
                  <button className="section-copy" onClick={(e) => { e.stopPropagation(); copy(post.caption); }}>
                    Copiar
                  </button>
                </div>
                <div className="section-body">{post.caption}</div>
              </div>
            )}
            {/* Observações ficam ocultas para reduzir poluição visual */}
          </div>

          <div className="calendar-divider" />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {(['draft', 'raw_uploaded'].includes(post.status) || canTransition(post.status, 'raw_uploaded')) && (
              <button className="ds-button-primary" aria-label="Marcar vídeo bruto" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'raw_uploaded'); }}>
                Vídeo bruto
              </button>
            )}
            {canTransition(post.status, 'editing') && (
              <button className="ds-button-primary" aria-label="Marcar em edição" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'editing'); }}>
                Em edição
              </button>
            )}
            {canTransition(post.status, 'approved') && (
              <button className="ds-button-primary" aria-label="Aprovar post" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'approved'); }}>
                Aprovar
              </button>
            )}
            {canTransition(post.status, 'published') && (
              <button className="ds-button-primary" aria-label="Publicar post" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'published'); }}>
                Publicar
              </button>
            )}
            {canTransition(post.status, 'draft') && (
              <button className="ds-button-primary" aria-label="Reverter para rascunho" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'draft'); }}>
                Reverter
              </button>
            )}
            <button className="ds-button-primary" aria-label="Arquivar post" onClick={(e) => { e.stopPropagation(); onArchive(post.id); }}>
              {post.archived_at ? 'Desarquivar' : 'Arquivar'}
            </button>
            <button className="ds-button-primary" aria-label="Excluir post" onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}>
              Excluir
            </button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="calendar-upload" onClick={(e) => e.stopPropagation()}>
              <input type="file" aria-label="Upload de mídia" onChange={(e) => onFile(post.id, e.target.files?.[0] ?? null)} />
              Anexar vídeo
            </label>
            <button className="ds-button-primary" onClick={(e) => { e.stopPropagation(); onUpload(post.id); }}>
              Enviar mídia
            </button>
            {post.media_path && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Mídia: {post.media_path}</span>
            )}
          </div>
        </article>
      ))}
      {posts.length >= pageSize * (page + 1) && (
        <button className="ds-button-primary" style={{ padding: '6px 10px', marginTop: 8 }} onClick={onNextPage}>
          Carregar mais
        </button>
      )}
    </div>
  );
}
