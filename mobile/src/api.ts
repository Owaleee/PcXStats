import type { Connection, GpuStats, Stats } from './types';

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
  if (!Array.isArray(data.gpus) || !data.gpus.every(isGpuStats)) {
    return false;
  }
  if (data.gpu_error !== null && typeof data.gpu_error !== 'string') {
    return false;
  }
  return typeof data.sampled_at === 'string' &&
    Number.isFinite(Date.parse(data.sampled_at)) &&
    (data.ram_total_gib as number) > 0 &&
    (data.disk_total_gib as number) > 0;
}

function isGpuStats(value: unknown): value is GpuStats {
  if (typeof value !== 'object' || value === null) return false;

  const gpu = value as Record<string, unknown>;

  return typeof gpu.id === 'string' &&
    gpu.id.trim().length > 0 &&
    typeof gpu.name === 'string' &&
    gpu.name.trim().length > 0 &&
    typeof gpu.usage_percent === 'number' &&
    Number.isFinite(gpu.usage_percent) &&
    gpu.usage_percent >= 0 &&
    gpu.usage_percent <= 100;
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
