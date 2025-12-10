import React, { useRef, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Post } from '../../types';

type Props = {
  onCreatedMany: (posts: Post[]) => void;
};

type CsvRow = Record<string, string>;
type NewPost = {
  title: string;
  channel: string | null;
  scheduled_at: string | null;
  topic: string | null;
  script: string | null;
  status: Post['status'];
  organization_id: string;
  notes: string | null;
};

const dayMap: Record<string, number> = {
  domingo: 0,
  'domingo-feira': 0,
  segunda: 1,
  'segunda-feira': 1,
  terca: 2,
  'terca-feira': 2,
  terça: 2,
  'terça-feira': 2,
  quarta: 3,
  'quarta-feira': 3,
  quinta: 4,
  'quinta-feira': 4,
  sexta: 5,
  'sexta-feira': 5,
  sabado: 6,
  sábado: 6,
  'sabado-feira': 6,
  'sábado-feira': 6,
};

function normalizeKey(key: string) {
  return key
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function splitCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((v) => v.trim());
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const header = splitCsvLine(lines[0]).map(normalizeKey);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (!cols.length) continue;
    const row: CsvRow = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx]?.replace(/^"|"$/g, '') ?? '';
    });
    rows.push(row);
  }
  return rows;
}

function buildDate(dateStr?: string, timeStr?: string) {
  if (!dateStr) return null;
  const rawDate = dateStr.trim();
  const rawTime = timeStr?.trim() || '12:00';
  const timeMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
  const hour = timeMatch ? Number(timeMatch[1]) : 12;
  const minute = timeMatch ? Number(timeMatch[2]) : 0;

  // dd/mm or dd/mm/yyyy
  const ddm = rawDate.match(/^(\\d{1,2})[\\/-](\\d{1,2})(?:[\\/-](\\d{2,4}))?/);
  if (ddm) {
    const day = Number(ddm[1]);
    const month = Number(ddm[2]) - 1;
    const year = ddm[3] ? Number(ddm[3].length === 2 ? `20${ddm[3]}` : ddm[3]) : new Date().getFullYear();
    const d = new Date(year, month, day, hour, minute);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  const lower = rawDate
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const weekday = dayMap[lower];
  if (weekday === undefined) return null;
  const now = new Date();
  const target = new Date(now);
  const diff = (weekday - now.getDay() + 7) % 7;
  target.setDate(now.getDate() + diff);
  target.setHours(hour, minute, 0, 0);
  return target.toISOString();
}

export function CsvUpload({ onCreatedMany }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupabaseConfigured) {
      setError('Configure o Supabase (.env.local) para usar o upload em lote.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      setLoading(false);
      setError('CSV vazio ou inválido.');
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const orgId =
      (sessionData.session?.user?.app_metadata as any)?.organization_id || (sessionData.session?.user?.user_metadata as any)?.organization_id;
    if (!orgId) {
      setLoading(false);
      setError('Usuário sem organização. Atualize o metadata ou o vínculo na tabela user_organizations.');
      return;
    }

    const payload = rows
      .map((row) => {
        const date = row.data ?? row['data_da_publicacao'];
        const horario = row.horario ?? row.horário ?? row.hora;
        const channel = row.canal ?? row.plataforma;
        const format = row.formato;
        const topic = row.tema_pauta ?? row.tema ?? row.pauta ?? row['tema/pauta'];
        const pillar = row.pilar_de_conteudo ?? row.pilar ?? row['pilar_de_conteudo'];
        const objective = row.objetivo;
        const scheduled_at = buildDate(date, horario);
        if (!topic && !channel && !scheduled_at) return null;
        const notesParts = [
          format ? `Formato: ${format}` : null,
          pillar ? `Pilar: ${pillar}` : null,
          objective ? `Objetivo: ${objective}` : null,
        ].filter(Boolean);
        const notes = notesParts.length ? notesParts.join(' | ') : null;
        const mapped: NewPost = {
          title: topic || channel || 'Post',
          channel: channel || null,
          scheduled_at,
          topic: topic || null,
          script: null,
          status: 'draft' as Post['status'],
          organization_id: orgId,
          notes,
        };
        return mapped;
      })
      .filter((p): p is NewPost => Boolean(p));

    if (!payload.length) {
      setLoading(false);
      setError('Nenhuma linha com dados suficientes para criar posts.');
      return;
    }

    const { data, error: insertError } = await supabase.from('posts').insert(payload).select();
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data) {
      onCreatedMany(data as Post[]);
      setMessage(`Importados ${data.length} posts do CSV.`);
    }
  };

  return (
    <div className="calendar-card">
      <h4 style={{ margin: '0 0 8px' }}>Importar CSV (planejamento semanal)</h4>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
        Colunas reconhecidas: Data, Horário, Canal, Formato, Tema/Pauta, Pilar de Conteúdo, Objetivo.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFile}
        disabled={loading}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="ds-button-primary"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        style={{ marginTop: 10, width: '100%' }}
      >
        {loading ? 'Importando...' : 'Escolher arquivo CSV'}
      </button>
      {message && <p style={{ margin: '8px 0 0', color: 'var(--color-status-success)' }}>{message}</p>}
      {error && <p style={{ margin: '8px 0 0', color: 'var(--color-status-error)' }}>{error}</p>}
    </div>
  );
}
