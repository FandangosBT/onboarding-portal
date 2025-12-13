import { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { allowedTransitionsByRole, filterPosts } from '../lib/calendar';
import { Post } from '../types';
import { FiltersBar } from '../components/calendar/FiltersBar';
import { ListView } from '../components/calendar/ListView';
import { WeekView } from '../components/calendar/WeekView';
import { MonthView } from '../components/calendar/MonthView';
import { getAccessLevel } from '../lib/permissions';
import { PostDrawer } from '../components/calendar/PostDrawer';
import { QuickCreatePost } from '../components/calendar/QuickCreatePost';
import { CsvUpload } from '../components/calendar/CsvUpload';
import '../styles/calendar.css';

type ViewMode = 'list' | 'weekly' | 'monthly';

export function Calendario() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | Post['status']>('all');
  const [channelFilter, setChannelFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [topicFilter, setTopicFilter] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [fileMap, setFileMap] = useState<Record<string, File | null>>({});
  const pageSize = 10;
  const [accessLevel, setAccessLevel] = useState<'admin' | 'usuario' | 'desconhecido'>('desconhecido');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadingMap, setUploadingMap] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const role = (data.user?.app_metadata as any)?.role || (data.user?.user_metadata as any)?.role;
      setAccessLevel(getAccessLevel(role));
    });
    const fetchPosts = async () => {
      if (!isSupabaseConfigured) {
        setPosts([]);
        setLoading(false);
        return;
      }
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data } = await supabase
        .from('posts')
        .select(
          'id,title,channel,status,scheduled_at,media_path,caption,archived_at,archive_location,week_number,weekday,topic,script,raw_video_path,edited_video_path,notes,reference_links,created_at,updated_at'
        )
        .order('scheduled_at', { ascending: true })
        .range(from, to);
      setPosts((prev) => (page === 0 ? data ?? [] : [...prev, ...(data ?? [])]));
      setLoading(false);
    };
    fetchPosts();
  }, [page]);

  const filtered = useMemo(
    () =>
      filterPosts(posts, {
        status: statusFilter,
        channel: channelFilter || undefined,
        includeArchived,
        from: null,
        to: null,
      }),
    [posts, statusFilter, channelFilter, includeArchived]
  );

  const fullyFiltered = useMemo(() => {
    return filtered.filter((p) => {
      if (weekFilter && p.week_number !== weekFilter) return false;
      if (topicFilter && !(p.topic || '').toLowerCase().includes(topicFilter.toLowerCase()) && !(p.title || '').toLowerCase().includes(topicFilter.toLowerCase()))
        return false;
      return true;
    });
  }, [filtered, weekFilter, topicFilter]);

  const statusSummary = useMemo(() => {
    const base = { draft: 0, raw_uploaded: 0, editing: 0, approved: 0, published: 0 };
    fullyFiltered.forEach((p) => {
      if (base[p.status as keyof typeof base] !== undefined) base[p.status as keyof typeof base] += 1;
    });
    return base;
  }, [fullyFiltered]);

  const updateStatus = async (id: string, status: Post['status']) => {
    if (accessLevel === 'desconhecido') return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const allowedMap = allowedTransitionsByRole(accessLevel);
    if (!allowedMap[post.status].includes(status)) return;
    if (!isSupabaseConfigured) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const actor = sessionData.session?.user?.id;
    await supabase.from('posts').update({ status, updated_by: actor }).eq('id', id);
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleCreated = (post: Post) => {
    // Mantém a lista ordenada por data agendada
    const sorted = [...posts, post].sort((a, b) => {
      const aDate = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
    setPosts(sorted);
    setViewMode('list');
  };

  const handleCreatedMany = (created: Post[]) => {
    const combined = [...posts, ...created].sort((a, b) => {
      const aDate = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
    setPosts(combined);
    setViewMode('list');
  };

  const toggleArchive = async (id: string) => {
    if (!isSupabaseConfigured) return;
    const isArchived = posts.find((p) => p.id === id)?.archived_at;
    const { error } = await supabase
      .from('posts')
      .update({
        archived_at: isArchived ? null : new Date().toISOString(),
        archive_location: isArchived ? null : 'manual',
      })
      .eq('id', id);
    if (!error) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, archived_at: isArchived ? null : new Date().toISOString(), archive_location: isArchived ? null : 'manual' } : p))
      );
    }
  };

  const deletePost = async (id: string) => {
    const confirmed = window.confirm('Excluir esta postagem? Esta ação não pode ser desfeita.');
    if (!confirmed) return;
    if (isSupabaseConfigured) {
      await supabase.from('posts').delete().eq('id', id);
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const uploadMedia = async (postId: string) => {
    const file = fileMap[postId];
    if (!file || !isSupabaseConfigured) return;
    setUploadingMap((prev) => ({ ...prev, [postId]: 'uploading' }));
    const { data: sessionData } = await supabase.auth.getSession();
    const orgId =
      (sessionData.session?.user?.app_metadata as any)?.organization_id || (sessionData.session?.user?.user_metadata as any)?.organization_id;
    const actor = sessionData.session?.user?.id || 'anon';
    const bucket = import.meta.env.VITE_SUPABASE_PRIVATE_BUCKET || 'secure-docs';
    const folder = accessLevel === 'admin' ? 'edited' : 'raw';
    const safeActor = actor.replace(/[^a-zA-Z0-9_-]/g, '');
    const path = `org/${orgId ?? 'demo'}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/calendar/${postId}/${folder}-${safeActor}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (uploadError) {
      setUploadingMap((prev) => ({ ...prev, [postId]: 'error' }));
      return;
    }
    const payload =
      accessLevel === 'admin'
        ? { edited_video_path: path, status: 'approved' as Post['status'] }
        : { raw_video_path: path, status: 'raw_uploaded' as Post['status'] };
    const { error: updateError } = await supabase.from('posts').update(payload).eq('id', postId);
    if (updateError) {
      setUploadingMap((prev) => ({ ...prev, [postId]: 'error' }));
      return;
    }
    setUploadingMap((prev) => ({ ...prev, [postId]: 'success' }));
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...payload } : p)));
  };

  const downloadMedia = async (path?: string | null) => {
    if (!path || !isSupabaseConfigured) return;
    const bucket = import.meta.env.VITE_SUPABASE_PRIVATE_BUCKET || 'secure-docs';
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 30);
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  if (loading) return <div className="ds-card">Carregando calendário...</div>;

  return (
    <div className="ds-card">
      <div className="calendar-hero" style={{ marginBottom: 12 }}>
        <div>
          <div className="eyebrow">Planejamento editorial</div>
          <h3>Calendário de Postagens</h3>
        </div>
        <span />
      </div>
      <div className={`calendar-grid ${accessLevel !== 'admin' ? 'calendar-grid--solo' : ''}`}>
        <div className="calendar-left">
          <FiltersBar
            status={statusFilter}
            onStatus={(s) => setStatusFilter(s as any)}
            channel={channelFilter}
            onChannel={setChannelFilter}
            week={weekFilter}
            onWeek={setWeekFilter}
            topic={topicFilter}
            onTopic={setTopicFilter}
            includeArchived={includeArchived}
            onIncludeArchived={setIncludeArchived}
            viewMode={viewMode}
            onView={setViewMode}
          />
          <div className="calendar-legend">
            <span className="calendar-legend-item">Mostrando {fullyFiltered.length} de {posts.length} posts</span>
            <span className="calendar-legend-item">Rascunho: {statusSummary.draft}</span>
            <span className="calendar-legend-item">Bruto: {statusSummary.raw_uploaded}</span>
            <span className="calendar-legend-item">Edição: {statusSummary.editing}</span>
            <span className="calendar-legend-item">Aprovado: {statusSummary.approved}</span>
            <span className="calendar-legend-item">Publicado: {statusSummary.published}</span>
          </div>
          {viewMode === 'list' && (
            <ListView
              posts={fullyFiltered}
              accessLevel={accessLevel}
              onStatusChange={updateStatus}
              onArchive={toggleArchive}
              onDelete={deletePost}
              onUpload={uploadMedia}
              onFile={(id, file) => setFileMap((prev) => ({ ...prev, [id]: file }))}
              pageSize={pageSize}
              page={page}
              onNextPage={() => setPage((p) => p + 1)}
              fileMap={fileMap}
              uploadingMap={uploadingMap}
              onDownload={downloadMedia}
              onOpen={(id) => setSelectedId(id)}
            />
          )}
          {viewMode === 'weekly' && <WeekView posts={fullyFiltered} onOpen={(id) => setSelectedId(id)} />}
          {viewMode === 'monthly' && <MonthView posts={fullyFiltered} onOpen={(id) => setSelectedId(id)} />}
        </div>
        {accessLevel === 'admin' && (
          <div className="calendar-right">
            <QuickCreatePost onCreated={handleCreated} />
            <CsvUpload onCreatedMany={handleCreatedMany} />
          </div>
        )}
      </div>
      {selectedId && (
        <PostDrawer
          post={posts.find((p) => p.id === selectedId) ?? null}
          onClose={() => setSelectedId(null)}
          onUpdated={(updated) => {
            setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
          }}
          accessLevel={accessLevel}
          onStatusChange={updateStatus}
          onUpload={uploadMedia}
        />
      )}
    </div>
  );
}
