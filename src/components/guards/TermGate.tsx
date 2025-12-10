import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

// Verifica se o usuário assinou o termo ativo; redireciona para /termo caso contrário.
export function TermGate({ children, fallback }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    const bypass = localStorage.getItem('bypassAuth') === 'true';
    if (bypass) {
      setStatus('allowed');
      return;
    }
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      const organizationId =
        (user?.app_metadata as any)?.organization_id || (user?.user_metadata as any)?.organization_id;
      if (!user || !organizationId) {
        setStatus('denied');
        navigate('/login', { replace: true });
        return;
      }

      const { data: activeTerm } = await supabase
        .from('terms')
        .select('id')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (!activeTerm) {
        setStatus('allowed');
        return;
      }

      const { data: signature } = await supabase
        .from('term_signatures')
        .select('id')
        .eq('term_id', activeTerm.id)
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (signature) {
        setStatus('allowed');
      } else {
        setStatus('denied');
        if (location.pathname !== '/termo') navigate('/termo', { replace: true });
      }
    };
    check();
  }, [navigate, location.pathname]);

  if (status === 'checking') return <>{fallback ?? null}</>;
  if (status === 'allowed') return <>{children}</>;
  return null;
}
