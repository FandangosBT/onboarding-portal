export type TaskStatus = 'pending' | 'review' | 'done';

export type OnboardingTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  step_id: string;
};

export type Post = {
  id: string;
  organization_id?: string;
  title: string;
  channel: string | null;
  status: 'draft' | 'raw_uploaded' | 'editing' | 'approved' | 'published';
  scheduled_at: string | null;
  media_path: string | null;
  caption: string | null;
  topic?: string | null;
  script?: string | null;
  raw_video_path?: string | null;
  edited_video_path?: string | null;
  notes?: string | null;
  week_number?: number | null;
  weekday?: number | null;
  reference_links?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  archived_at: string | null;
  archive_location: string | null;
};
