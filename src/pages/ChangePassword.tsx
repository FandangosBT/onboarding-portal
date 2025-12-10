import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Senhas não conferem.');
      return;
    }
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    const currentMeta = (user?.user_metadata as any) || {};
    const { error } = await supabase.auth.updateUser({
      password,
      data: { ...currentMeta, force_password_change: false },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Senha atualizada. Redirecionando...');
      setTimeout(() => navigate('/dashboard', { replace: true }), 800);
    }
  };

  return (
    <div className="ds-card" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h3 style={{ marginTop: 0 }}>Trocar senha</h3>
      <p style={{ color: 'var(--color-text-secondary)' }}>Defina uma nova senha para continuar.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input className="ds-field" type="password" placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="ds-field" type="password" placeholder="Confirmar senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <button className="ds-button-primary" type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar e continuar'}
        </button>
      </form>
      {message && <p style={{ marginTop: 10, color: 'var(--color-brand-gold)' }}>{message}</p>}
    </div>
  );
}
