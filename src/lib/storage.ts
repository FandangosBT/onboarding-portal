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
      // fallback GET in case some platform blocks POST to /api
      const respGet = await fetch(`${signProxy}?path=${encodeURIComponent(path)}&expiresIn=${expiresInSeconds}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (respGet.ok) {
        const json = await respGet.json();
        if (json?.signedUrl) return json.signedUrl as string;
      }
      // Se há proxy configurado mas falhou, não tente direto com anon (evita 500 do storage)
      return null;
    }
  } catch (err) {
    console.warn('Proxy de assinatura indisponível', err);
  }

  // Fallback somente quando não há proxy configurado ou não há token (ex.: modo demo)
  const primary = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (!primary.error && primary.data?.signedUrl) return primary.data.signedUrl;
  if (primary.error) console.warn('Falha ao gerar URL assinada', primary.error);
  return null;
}
