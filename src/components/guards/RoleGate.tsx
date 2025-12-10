import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canAccessModule, getUserRole, ModuleKey } from '../../lib/permissions';

type Props = {
  module: ModuleKey;
  children: ReactNode;
  fallback?: ReactNode;
};

// Restringe por módulo com base no papel do usuário.
export function RoleGate({ module, children, fallback }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    getUserRole().then((role) => {
      if (canAccessModule(module, role)) {
        setStatus('allowed');
      } else {
        setStatus('denied');
      }
    });
  }, [module]);

  if (status === 'checking') return <>{fallback ?? null}</>;
  if (status === 'allowed') return <>{children}</>;
  // Fallback amigável; pode ser substituído pela UI do app.
  return fallback ? <>{fallback}</> : <AccessDenied onBack={() => navigate(-1)} />;
}

function AccessDenied({ onBack }: { onBack?: () => void }) {
  return (
    <div className="ds-card" style={{ padding: '24px' }}>
      <h3 style={{ marginBottom: 8 }}>Acesso restrito</h3>
      <p style={{ marginBottom: 12 }}>Você não possui permissão para acessar este módulo.</p>
      <button className="ds-button-primary" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
