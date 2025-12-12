import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type Mode = 'login' | 'signup' | 'reset';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgId, setOrgId] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else navigate('/dashboard');
    }

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { organization_id: orgId, role: 'client_user', force_password_change: true } },
      });
      if (error) setMessage(error.message);
      if (data.user && orgId) {
        await supabase.rpc('self_join_organization', { p_org: orgId, p_role: 'client_user' });
      }
      if (!error) setMessage('Conta criada. Verifique o email e faça login.');
    }

    if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      setMessage(error ? error.message : 'Se existir conta, um email foi enviado.');
    }

    setLoading(false);
  };

  const bypass = () => {
    localStorage.setItem('bypassAuth', 'true');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="ds-card" style={{ maxWidth: 420, margin: '40px auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <img src="/TimeOS.png" alt="TimeOS" style={{ width: 108, height: 108, objectFit: 'contain' }} />
      </div>
      <h2 style={{ marginBottom: 4 }}>Bem-vindo ao TimeOS Portal</h2>
      <p style={{ marginTop: 0, marginBottom: 12 }}>Insira seu login e senha para entrar</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          className="ds-field"
          placeholder="Email"
          type="email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode !== 'reset' && (
          <input
            className="ds-field"
            placeholder="Senha"
            type="password"
            aria-label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        {mode === 'signup' && (
          <input
            className="ds-field"
            placeholder="Organization ID"
            aria-label="Organization ID"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            required
          />
        )}
        <button className="ds-button-primary" type="submit" disabled={loading}>
          {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar reset'}
        </button>
      </form>
      {message && <p style={{ marginTop: 12, color: 'var(--color-brand-gold)' }}>{message}</p>}
    </div>
  );
}
