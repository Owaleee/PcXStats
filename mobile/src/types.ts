export type GpuStats = {
  id: string;
  name: string;
  usage_percent: number;
};

export type Stats = {
  cpu_percent: number;
  ram_percent: number;
  ram_used_gib: number;
  ram_total_gib: number;
  disk_percent: number;
  disk_used_gib: number;
  disk_total_gib: number;
  sampled_at: string;
  gpus: GpuStats[];
  gpu_error: string | null;
};

export type Connection = {
  baseUrl: string;
  token: string;
};