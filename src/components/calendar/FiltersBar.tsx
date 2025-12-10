type Props = {
  status: string;
  onStatus: (s: string) => void;
  channel: string;
  onChannel: (s: string) => void;
  week?: number | null;
  onWeek?: (w: number | null) => void;
  topic?: string;
  onTopic?: (t: string) => void;
  includeArchived: boolean;
  onIncludeArchived: (v: boolean) => void;
  viewMode: 'list' | 'weekly' | 'monthly';
  onView: (v: 'list' | 'weekly' | 'monthly') => void;
};

export function FiltersBar({
  status,
  onStatus,
  channel,
  onChannel,
  week,
  onWeek,
  topic,
  onTopic,
  includeArchived,
  onIncludeArchived,
  viewMode,
  onView,
}: Props) {
  return (
    <div className="calendar-filters">
      <div>
        <label>Status</label>
        <select className="ds-field" value={status} onChange={(e) => onStatus(e.target.value)} aria-label="Filtro de status">
          <option value="all">Todos</option>
          <option value="draft">Rascunho</option>
          <option value="raw_uploaded">Vídeo bruto</option>
          <option value="editing">Em edição</option>
          <option value="approved">Aprovado</option>
          <option value="published">Publicado</option>
        </select>
      </div>
      <div>
        <label>Canal</label>
        <input className="ds-field" value={channel} onChange={(e) => onChannel(e.target.value)} placeholder="Instagram, LinkedIn..." aria-label="Filtro de canal" />
      </div>
      <div>
        <label>Semana (ISO)</label>
        <input
          className="ds-field"
          type="number"
          min={1}
          max={53}
          value={week ?? ''}
          onChange={(e) => onWeek?.(e.target.value ? Number(e.target.value) : null)}
          placeholder="Ex.: 42"
          aria-label="Filtro de semana"
        />
      </div>
      <div>
        <label>Tópico</label>
        <input className="ds-field" value={topic ?? ''} onChange={(e) => onTopic?.(e.target.value)} placeholder="Tema ou título" aria-label="Filtro de tópico" />
      </div>
      <label
        className="archive-toggle"
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}
      >
        <input type="checkbox" checked={includeArchived} onChange={(e) => onIncludeArchived(e.target.checked)} />
        Mostrar arquivados
      </label>
      <div className="view-toggle" style={{ gridColumn: 'span 2' }}>
        <button className="ds-button-primary" aria-label="Visualizar em lista" onClick={() => onView('list')} disabled={viewMode === 'list'}>
          Lista
        </button>
        <button className="ds-button-primary" aria-label="Visualizar semanal" onClick={() => onView('weekly')} disabled={viewMode === 'weekly'}>
          Semanal
        </button>
      </div>
    </div>
  );
}
