import { Post } from '../../types';
import { StatusPill } from './StatusPill';

const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function WeekView({ posts, onOpen }: { posts: Post[]; onOpen?: (id: string) => void }) {
  const byDay: Record<string, Post[]> = {};
  posts.forEach((p) => {
    const weekday = p.weekday ?? (p.scheduled_at ? new Date(p.scheduled_at).getDay() : -1);
    const dayKey = weekday >= 0 ? weekdayNames[weekday] : 'Sem data';
    if (!byDay[dayKey]) byDay[dayKey] = [];
    byDay[dayKey].push(p);
  });

  return (
    <div className="ds-grid">
      {Object.entries(byDay).map(([day, items]) => (
        <div key={day} className="calendar-week-column">
          <div className="calendar-week-header">
            <span>▢</span>
            <strong>{day}</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {items.map((post) => (
              <div
                key={post.id}
                className="calendar-week-card"
                style={{ cursor: onOpen ? 'pointer' : 'default' }}
                onClick={() => onOpen?.(post.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{post.topic || post.title}</span>
                  <StatusPill status={post.status} />
                </div>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  {post.scheduled_at ? new Date(post.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Sem horário'} ·{' '}
                  {post.channel ?? '-'}
                </small>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
