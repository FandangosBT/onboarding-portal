export type PostComment = {
  id: string;
  post_id: string;
  organization_id: string;
  user_id: string | null;
  body: string;
  created_at: string;
};
