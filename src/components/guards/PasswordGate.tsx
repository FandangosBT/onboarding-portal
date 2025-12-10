import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

// Redireciona para troca de senha se o usuário tiver o flag force_password_change.
export function PasswordGate({ children, fallback }: Props) {
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
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      const force = (user?.user_metadata as any)?.force_password_change;
      if (force && location.pathname !== '/trocar-senha') {
        setStatus('denied');
        navigate('/trocar-senha', { replace: true });
        return;
      }
      setStatus('allowed');
    };
    check();
  }, [navigate, location.pathname]);

  if (status === 'checking') return <>{fallback ?? null}</>;
  if (status === 'allowed') return <>{children}</>;
  return null;
}
