import { ReactNode, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/shell.css';

type NavItem = { label: string; path: string; hotkey?: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Onboarding', path: '/onboarding' },
  { label: 'Financeiro', path: '/financeiro' },
  { label: 'Calendário', path: '/calendario' },
  { label: 'CRM', path: '/crm' },
  { label: 'Reuniões', path: '/reunioes' },
  { label: 'Avisos', path: '/avisos' },
  { label: 'Usuários', path: '/usuarios' },
  { label: 'Termo', path: '/termo' },
];

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  const section = useMemo(() => {
    const match = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path));
    return match?.label ?? 'Dashboard';
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const name = (u?.user_metadata as any)?.name || u?.email || 'usuário';
      setUserName(name);
    });
  }, []);

  return (
    <div className="app-shell">
      <aside className="shell-nav">
        <div className="shell-brand" onClick={() => navigate('/dashboard')}>
          <div className="brand-mark">
            <img src="/assets/TimeOS.png" alt="TimeOS" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div>
            <div className="brand-title">TimeOS</div>
            <div className="brand-sub">Q7 OPS</div>
          </div>
        </div>
        <div className="shell-nav-title">Módulos</div>
        <nav className="shell-nav-links" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} className="shell-link">
              {({ isActive }) => (
                <span className={isActive ? 'shell-link-active' : 'shell-link-idle'}>
                  <span className="link-dot" />
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="shell-footer">
          <span className="pill ghost">Modo teste</span>
        </div>
      </aside>

      <main className="shell-main">
        <header className="shell-topbar">
          <div>
            <p className="shell-eyebrow">Central de Operações</p>
            <h1 className="shell-heading">{section}</h1>
          </div>
          <div className="shell-top-actions">
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
              Bem-vindo(a), {userName}
            </span>
            <button
              className="ds-button-primary"
              aria-label="Sair"
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('bypassAuth');
                navigate('/login', { replace: true });
              }}
            >
              Sair
            </button>
          </div>
        </header>
        <div className="shell-content">{children}</div>
      </main>
    </div>
  );
}
