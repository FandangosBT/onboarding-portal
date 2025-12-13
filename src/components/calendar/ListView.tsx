import { canTransition } from '../../lib/calendar';
import { Post } from '../../types';
import { StatusPill } from './StatusPill';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

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
  uploadingMap: Record<string, UploadState>;
  onDownload: (path: string) => void;
  onOpen?: (id: string) => void;
  accessLevel: 'admin' | 'usuario' | 'desconhecido';
};

function formatDateTime(value: string | null) {
  if (!value) return 'Sem data';
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ListView({
  posts,
  onStatusChange,
  onArchive,
  onDelete,
  onUpload,
  onFile,
  pageSize,
  page,
  onNextPage,
  fileMap,
  uploadingMap,
  onDownload,
  onOpen,
  accessLevel,
}: Props) {
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
              accessLevel === 'admin' && (
                <button className="ds-button-primary" aria-label="Publicar post" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'published'); }}>
                  Publicar
                </button>
              )
            )}
            {canTransition(post.status, 'draft') && (
              <button className="ds-button-primary" aria-label="Reverter para rascunho" onClick={(e) => { e.stopPropagation(); onStatusChange(post.id, 'draft'); }}>
                Reverter
              </button>
            )}
            {accessLevel === 'admin' && (
              <>
                <button className="ds-button-primary" aria-label="Arquivar post" onClick={(e) => { e.stopPropagation(); onArchive(post.id); }}>
                  {post.archived_at ? 'Desarquivar' : 'Arquivar'}
                </button>
                <button className="ds-button-primary" aria-label="Excluir post" onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}>
                  Excluir
                </button>
              </>
            )}
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="calendar-upload" onClick={(e) => e.stopPropagation()}>
              <input type="file" aria-label="Upload de mídia" onChange={(e) => onFile(post.id, e.target.files?.[0] ?? null)} />
              Anexar vídeo
            </label>
            <button
              className="ds-button-primary"
              onClick={(e) => { e.stopPropagation(); onUpload(post.id); }}
              disabled={!fileMap[post.id] || uploadingMap[post.id] === 'uploading'}
            >
              {uploadingMap[post.id] === 'uploading' ? 'Enviando...' : 'Enviar mídia'}
            </button>
            {uploadingMap[post.id] === 'success' && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-status-success)' }}>Upload salvo</span>
            )}
            {uploadingMap[post.id] === 'error' && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-status-error)' }}>Falha no upload. Tente novamente.</span>
            )}
            {(fileMap[post.id] || post.raw_video_path || post.edited_video_path) && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {fileMap[post.id] && (
                  <span className="calendar-tag" title={fileMap[post.id]?.name}>
                    Selecionado · {fileMap[post.id]?.name}
                  </span>
                )}
                {post.raw_video_path && (
                  <button
                    className="calendar-tag"
                    type="button"
                    title={post.raw_video_path}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(post.raw_video_path as string);
                    }}
                    style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, color: 'inherit' }}
                  >
                    Bruto salvo · {post.raw_video_path.split('/').pop()}
                  </button>
                )}
                {post.edited_video_path && (
                  <button
                    className="calendar-tag"
                    type="button"
                    title={post.edited_video_path}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(post.edited_video_path as string);
                    }}
                    style={{ cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, color: 'inherit' }}
                  >
                    Editado salvo · {post.edited_video_path.split('/').pop()}
                  </button>
                )}
              </div>
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
