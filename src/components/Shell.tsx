import { ReactNode, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/shell.css';

type NavItem = { label: string; path: string; icon: string; hotkey?: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '🧭' },
  { label: 'Onboarding', path: '/onboarding', icon: '🚀' },
  { label: 'Financeiro', path: '/financeiro', icon: '💰' },
  { label: 'Calendário', path: '/calendario', icon: '📅' },
  { label: 'CRM', path: '/crm', icon: '📇' },
  { label: 'Reuniões', path: '/reunioes', icon: '📞' },
  { label: 'Avisos', path: '/avisos', icon: '🔔' },
  { label: 'Usuários', path: '/usuarios', icon: '👥' },
  { label: 'Termo', path: '/termo', icon: '📝' },
];

export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAdmin = useMemo(
    () => userRole === 'internal_admin' || userRole === 'internal_staff',
    [userRole],
  );

  const availableNavItems = useMemo(() => {
    if (isAdmin) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.label !== 'Usuários' && item.label !== 'Termo');
  }, [isAdmin]);

  const section = useMemo(() => {
    const match = availableNavItems.find((item) => location.pathname.startsWith(item.path));
    return match?.label ?? 'Dashboard';
  }, [availableNavItems, location.pathname]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      const name = (u?.user_metadata as any)?.name || u?.email || 'usuário';
      setUserName(name);
      const role = (u?.user_metadata as any)?.role || (u?.app_metadata as any)?.role;
      setUserRole(role || '');
    });
    // Prefere nav recolhida em telas menores
    const handleResize = () => {
      const mobile = window.innerWidth < 960;
      setIsMobile(mobile);
      setNavCollapsed(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-shell ${navCollapsed ? 'nav-collapsed' : ''} ${isMobile ? 'is-mobile' : ''}`}>
      {!isMobile && (
        <aside className={`shell-nav ${navCollapsed ? 'collapsed' : ''}`}>
          <button
            className="shell-collapse"
            onClick={() => setNavCollapsed((v) => !v)}
            aria-label={navCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {navCollapsed ? '⟩' : '⟨'}
          </button>
          <div className="shell-brand" onClick={() => navigate('/dashboard')}>
            <div className="brand-mark">
              <img src="/TimeOS.png" alt="TimeOS" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <div className="brand-title">TimeOS</div>
              <div className="brand-sub">Q7 OPS</div>
            </div>
          </div>
          <div className="shell-nav-title">Módulos</div>
          <nav className="shell-nav-links" aria-label="Navegação principal">
            {availableNavItems.map((item) => (
              <NavLink key={item.path} to={item.path} className="shell-link">
                {({ isActive }) => (
                  <span className={isActive ? 'shell-link-active' : 'shell-link-idle'} title={item.label}>
                    <span className="link-dot" />
                    <span className="link-label">{item.label}</span>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="shell-footer">
            <span className="pill ghost">Modo teste</span>
          </div>
        </aside>
      )}

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

      {isMobile && (
        <nav className="shell-bottom-nav" aria-label="Navegação inferior">
          {availableNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} className="bottom-link">
              {({ isActive }) => (
                <span className={isActive ? 'bottom-link-active' : 'bottom-link-idle'} title={item.label}>
                  <span className="link-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="sr-only">{item.label}</span>
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
