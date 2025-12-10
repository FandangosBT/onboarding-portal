import { Post } from '../../types';
import { StatusPill } from './StatusPill';

export function MonthView({ posts, onOpen }: { posts: Post[]; onOpen?: (id: string) => void }) {
  return (
    <div className="calendar-month-grid">
      {posts.map((post) => (
        <div key={post.id} className="calendar-card" style={{ cursor: onOpen ? 'pointer' : 'default' }} onClick={() => onOpen?.(post.id)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{post.topic || post.title}</div>
              <p style={{ margin: '4px 0', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('pt-BR') : 'Sem data'} — {post.channel ?? '-'}
              </p>
            </div>
            <StatusPill status={post.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
