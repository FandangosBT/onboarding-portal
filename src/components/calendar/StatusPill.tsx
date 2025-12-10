import { Post } from '../../types';

export function StatusPill({ status }: { status: Post['status'] }) {
  const map: Record<Post['status'], { color: string; label: string }> = {
    draft: { color: 'var(--color-text-secondary)', label: 'Rascunho' },
    raw_uploaded: { color: 'var(--color-status-warning)', label: 'Vídeo bruto' },
    editing: { color: 'var(--color-status-info)', label: 'Em edição' },
    approved: { color: 'var(--color-brand-gold)', label: 'Aprovado' },
    published: { color: 'var(--color-status-success)', label: 'Publicado' },
  };
  const { color, label } = map[status];
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
      {label}
    </span>
  );
}
