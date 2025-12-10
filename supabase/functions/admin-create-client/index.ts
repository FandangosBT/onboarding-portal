import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    const callerClient = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader ?? '' } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerData } = await callerClient.auth.getUser();
    const caller = callerData.user;
    const callerRole = (caller?.app_metadata as any)?.role || (caller?.user_metadata as any)?.role;
    if (!caller || (callerRole !== 'internal_admin' && callerRole !== 'internal_staff')) {
      return Response.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
    const { email, name, orgId, role, tempPassword, forcePasswordChange = true } = body;
    if (!email || !orgId || !role || !tempPassword) {
      return Response.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
    }
    if (!['client_owner', 'client_user'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400, headers: corsHeaders });
    }

    const { data: org, error: orgErr } = await supabaseAdmin.from('organizations').select('id').eq('id', orgId).maybeSingle();
    if (orgErr) return Response.json({ error: orgErr.message }, { status: 400, headers: corsHeaders });
    if (!org) return Response.json({ error: 'Organization not found' }, { status: 404, headers: corsHeaders });

    const existingRes = await supabaseAdmin.auth.admin.listUsers({ email }).catch(() => null);
    const existingUser = existingRes?.data?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      await supabaseAdmin.from('user_invites').insert({
        target_email: email,
        target_role: role,
        organization_id: orgId,
        target_user_id: existingUser.id,
        status: 'exists',
        result: 'User already exists',
        created_by: caller.id,
      });
      return Response.json({ error: 'User already exists' }, { status: 409, headers: corsHeaders });
    }

    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name, role, organization_id: orgId, force_password_change: forcePasswordChange },
    });
    if (createRes.error || !createRes.data.user) {
      await supabaseAdmin.from('user_invites').insert({
        target_email: email,
        target_role: role,
        organization_id: orgId,
        status: 'error',
        result: createRes.error?.message ?? 'Unknown error',
        created_by: caller.id,
      });
      return Response.json({ error: createRes.error?.message ?? 'Create failed' }, { status: 500, headers: corsHeaders });
    }

    const userId = createRes.data.user.id;
    const linkRes = await supabaseAdmin.from('user_organizations').insert({
      user_id: userId,
      organization_id: orgId,
      role,
    });
    if (linkRes.error) {
      await supabaseAdmin.from('user_invites').insert({
        target_email: email,
        target_role: role,
        organization_id: orgId,
        target_user_id: userId,
        status: 'error',
        result: linkRes.error.message,
        created_by: caller.id,
      });
      return Response.json({ error: linkRes.error.message }, { status: 500, headers: corsHeaders });
    }

    await supabaseAdmin.from('user_invites').insert({
      target_email: email,
      target_role: role,
      organization_id: orgId,
      target_user_id: userId,
      status: 'success',
      result: 'User created and linked',
      created_by: caller.id,
    });

    return Response.json({ ok: true, userId }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
}

// @ts-ignore
Deno.serve(handler);
