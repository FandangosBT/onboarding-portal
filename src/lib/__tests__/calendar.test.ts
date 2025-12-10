import { describe, expect, it } from 'vitest';
import { canTransition, filterPosts } from '../calendar';
import { Post } from '../../types';

const sample: Post[] = [
  { id: '1', title: 'A', channel: 'ig', status: 'draft', scheduled_at: '2024-01-01', media_path: null, caption: null, archived_at: null, archive_location: null },
  { id: '2', title: 'B', channel: 'li', status: 'approved', scheduled_at: '2024-01-02', media_path: null, caption: null, archived_at: null, archive_location: null },
  { id: '3', title: 'C', channel: 'ig', status: 'published', scheduled_at: '2024-01-03', media_path: null, caption: null, archived_at: '2024-02-01', archive_location: 'manual' },
];

describe('canTransition', () => {
  it('allows draft to approved/published', () => {
    expect(canTransition('draft', 'approved')).toBe(true);
    expect(canTransition('draft', 'published')).toBe(true);
  });
  it('allows approved to published and revert to draft', () => {
    expect(canTransition('approved', 'published')).toBe(true);
    expect(canTransition('approved', 'draft')).toBe(true);
  });
  it('blocks same status', () => {
    expect(canTransition('draft', 'draft')).toBe(false);
  });
});

describe('filterPosts', () => {
  it('filters by status and channel', () => {
    const res = filterPosts(sample, { status: 'approved', channel: 'li', includeArchived: false });
    expect(res.map((p) => p.id)).toEqual(['2']);
  });
  it('excludes archived unless flagged', () => {
    expect(filterPosts(sample, { status: 'all', includeArchived: false }).length).toBe(2);
    expect(filterPosts(sample, { status: 'all', includeArchived: true }).length).toBe(3);
  });
});
