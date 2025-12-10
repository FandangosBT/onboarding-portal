import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AdminCreateClient } from '../components/AdminCreateClient';
import { ClientList } from '../components/ClientList';

export function Usuarios() {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase
      .from('organizations')
      .select('id,name')
      .order('name', { ascending: true })
      .then(({ data }) => setOrganizations(data ?? []));
  }, []);

  return (
    <div className="ds-grid">
      <AdminCreateClient organizations={organizations} />
      <ClientList />
    </div>
  );
}
