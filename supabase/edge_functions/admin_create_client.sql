-- Pseudocode SQL para edge function/ RPC (executar como service role)
-- Input: p_email, p_name, p_org uuid, p_role public.user_role, p_temp_password text
-- Requer chamador com papel admin/staff (validar externamente) e service role para Auth Admin API.
-- Obs.: implementação real recomendada em JS/TS edge function usando supabase-js admin.

-- create or replace function public.admin_create_client(...) returns void language plpgsql ...;
-- Dentro: 
-- 1) criar usuário via auth.admin api (feito na edge function, não em SQL).
-- 2) inserir em user_organizations (user_id, organization_id, role)
-- 3) atualizar metadata (role, organization_id, name)
-- 4) enviar reset password (auth.admin.generateLink)
-- 5) registrar auditoria em user_invites

-- Este arquivo é uma referência; a implementação deve ficar em edge function TS com service key.
