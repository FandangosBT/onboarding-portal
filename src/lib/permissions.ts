import { supabase } from './supabaseClient';

export type UserRole = 'client_owner' | 'client_user' | 'internal_admin' | 'internal_staff';
export type AccessLevel = 'admin' | 'usuario' | 'desconhecido';

export type ModuleKey =
  | 'dashboard'
  | 'onboarding'
  | 'financeiro'
  | 'calendario'
  | 'crm'
  | 'reunioes'
  | 'avisos';

const moduleAccess: Record<ModuleKey, UserRole[]> = {
  dashboard: ['internal_admin', 'internal_staff', 'client_owner', 'client_user'],
  onboarding: ['internal_admin', 'internal_staff', 'client_owner', 'client_user'],
  financeiro: ['internal_admin', 'internal_staff', 'client_owner', 'client_user'],
  calendario: ['internal_admin', 'internal_staff', 'client_owner', 'client_user'],
  crm: ['internal_admin', 'internal_staff'],
  reunioes: ['internal_admin', 'internal_staff', 'client_owner', 'client_user'],
  avisos: ['internal_admin', 'internal_staff', 'client_owner', 'client_user'],
};

export async function getUserRole(): Promise<UserRole | null> {
  const { data } = await supabase.auth.getUser();
  const role = (data.user?.app_metadata?.role || data.user?.user_metadata?.role) as UserRole | undefined;
  return role ?? null;
}

export function canAccessModule(module: ModuleKey, role: UserRole | null): boolean {
  if (!role) return false;
  return moduleAccess[module]?.includes(role);
}

export function getAccessLevel(role: UserRole | null): AccessLevel {
  if (!role) return 'desconhecido';
  if (role === 'internal_admin' || role === 'internal_staff') return 'admin';
  if (role === 'client_owner' || role === 'client_user') return 'usuario';
  return 'desconhecido';
}
