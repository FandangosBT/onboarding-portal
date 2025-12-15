import { supabase, supabaseService } from './supabaseClient';

const DEFAULT_EXPIRES = 60 * 30;
const bucket = import.meta.env.VITE_SUPABASE_PRIVATE_BUCKET || 'secure-docs';

export async function getSignedDownloadUrl(path: string, expiresInSeconds: number = DEFAULT_EXPIRES) {
  if (supabaseService) {
    const secondary = await supabaseService.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    if (!secondary.error && secondary.data?.signedUrl) return secondary.data.signedUrl;
    if (secondary.error) console.warn('Falha ao gerar URL assinada com service role', secondary.error);
  }

  const primary = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (!primary.error && primary.data?.signedUrl) return primary.data.signedUrl;
  if (primary.error) console.warn('Falha ao gerar URL assinada', primary.error);
  return null;
}
