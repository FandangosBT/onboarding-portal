import { Post } from '../types';

export type PostStatus = 'draft' | 'raw_uploaded' | 'editing' | 'approved' | 'published';

export function canTransition(from: PostStatus, to: PostStatus): boolean {
  if (from === to) return false;
  if (from === 'draft' && (to === 'raw_uploaded' || to === 'approved' || to === 'published')) return true;
  if (from === 'raw_uploaded' && (to === 'editing' || to === 'approved')) return true;
  if (from === 'editing' && (to === 'approved' || to === 'published')) return true;
  if (from === 'approved' && to === 'published') return true;
  if (['approved', 'published', 'raw_uploaded', 'editing'].includes(from) && to === 'draft') return true; // ajuste/reversão
  return false;
}

export function allowedTransitionsByRole(role: 'admin' | 'usuario' | 'desconhecido'): Record<PostStatus, PostStatus[]> {
  if (role === 'admin') {
    return {
      draft: ['raw_uploaded', 'editing', 'approved', 'published'],
      raw_uploaded: ['editing', 'approved', 'draft'],
      editing: ['approved', 'published', 'draft'],
      approved: ['published', 'draft'],
      published: ['draft'],
    };
  }
  if (role === 'usuario') {
    return {
      draft: ['raw_uploaded', 'approved'],
      raw_uploaded: ['approved', 'draft'],
      editing: ['draft'],
      approved: ['draft'],
      published: ['draft'],
    };
  }
  return { draft: [], raw_uploaded: [], editing: [], approved: [], published: [] };
}

export function filterPosts(
  posts: Post[],
  opts: { status?: PostStatus | 'all'; channel?: string; includeArchived?: boolean; from?: Date | null; to?: Date | null }
): Post[] {
  return posts.filter((p) => {
    if (!opts.includeArchived && p.archived_at) return false;
    if (opts.status && opts.status !== 'all' && p.status !== opts.status) return false;
    if (opts.channel && p.channel !== opts.channel) return false;
    if (opts.from && p.scheduled_at && new Date(p.scheduled_at) < opts.from) return false;
    if (opts.to && p.scheduled_at && new Date(p.scheduled_at) > opts.to) return false;
    return true;
  });
}
