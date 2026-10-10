import type { Connection, Stats } from './types';

// TypeScript não verifica sozinho um JSON recebido pela rede.
function isStats(value: unknown): value is Stats {
  if (typeof value !== 'object' || value === null) return false;
  const data = value as Record<string, unknown>;
  const fields = [
    'cpu_percent', 'ram_percent', 'ram_used_gib', 'ram_total_gib',
    'disk_percent', 'disk_used_gib', 'disk_total_gib',
  ];
  if (!fields.every((key) =>
    typeof data[key] === 'number' && Number.isFinite(data[key]) && data[key] >= 0
  )) return false;
  if (![data.cpu_percent, data.ram_percent, data.disk_percent].every(
    (value) => (value as number) <= 100
  )) return false;
  return typeof data.sampled_at === 'string' &&
    Number.isFinite(Date.parse(data.sampled_at)) &&
    (data.ram_total_gib as number) > 0 &&
    (data.disk_total_gib as number) > 0;
}

export async function fetchStats(
  connection: Connection,
  signal: AbortSignal,
): Promise<Stats> {
  const response = await fetch(`${connection.baseUrl}/stats`, {
    headers: { Authorization: `Bearer ${connection.token}` },
    signal,
  });
  if (response.status === 401) throw new Error('Chave de acesso inválida.');
  if (!response.ok) throw new Error(`O agente respondeu HTTP ${response.status}.`);
  const data: unknown = await response.json();
  if (!isStats(data)) throw new Error('O agente retornou dados inesperados.');
  return data;
}
