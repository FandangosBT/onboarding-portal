import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!supabase || !supabaseUrl || !serviceKey)
      return res.status(500).json({ error: 'Supabase service key not configured' });

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return res.status(401).json({ error: 'Invalid token' });

    const payload = (req.method === 'GET' ? req.query : req.body) as { path?: string; expiresIn?: number | string };
    const path = payload.path as string | undefined;
    const expiresInRaw = payload.expiresIn as number | string | undefined;
    const expiresIn = typeof expiresInRaw === 'string' ? parseInt(expiresInRaw, 10) || 1800 : expiresInRaw ?? 1800;
    if (!path) return res.status(400).json({ error: 'Path is required' });

    const orgId =
      (userData.user.app_metadata as any)?.organization_id || (userData.user.user_metadata as any)?.organization_id || null;
    if (orgId && !path.includes(orgId)) return res.status(403).json({ error: 'Path not allowed for this user' });

    const bucket = process.env.VITE_SUPABASE_PRIVATE_BUCKET || process.env.SUPABASE_PRIVATE_BUCKET || 'secure-docs';
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error || !data?.signedUrl) {
      console.error('sign-url error', error);
      return res.status(500).json({ error: 'Failed to sign url', details: error?.message });
    }

    return res.status(200).json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    console.error('sign-url uncaught', err);
    return res.status(500).json({ error: 'Unexpected error', details: err?.message });
  }
}
