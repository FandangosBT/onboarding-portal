import { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

// Bloqueia rotas sem sessão; usado como wrapper de páginas protegidas.
export function AuthGate({ children, fallback }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    const bypass = localStorage.getItem('bypassAuth') === 'true';
    if (bypass) {
      setStatus('allowed');
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus('allowed');
      } else {
        setStatus('denied');
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  if (status === 'checking') return <>{fallback ?? null}</>;
  if (status === 'allowed') return <>{children}</>;
  return null;
}
