import { supabase } from './supabaseClient';

const DEFAULT_EXPIRES = 60 * 30;
const bucket = import.meta.env.VITE_SUPABASE_PRIVATE_BUCKET || 'secure-docs';
const signProxy = import.meta.env.VITE_SIGN_URL_ENDPOINT || '/api/sign-url';

export async function getSignedDownloadUrl(path: string, expiresInSeconds: number = DEFAULT_EXPIRES) {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (signProxy && token) {
      const resp = await fetch(signProxy, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ path, expiresIn: expiresInSeconds }),
      });
      if (resp.ok) {
        const json = await resp.json();
        if (json?.signedUrl) return json.signedUrl as string;
      }
    }
  } catch (err) {
    console.warn('Proxy de assinatura indisponível', err);
  }

  const primary = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (!primary.error && primary.data?.signedUrl) return primary.data.signedUrl;
  if (primary.error) console.warn('Falha ao gerar URL assinada', primary.error);
  return null;
}
