export type Stats = {
  cpu_percent: number;
  ram_percent: number;
  ram_used_gib: number;
  ram_total_gib: number;
  disk_percent: number;
  disk_used_gib: number;
  disk_total_gib: number;
  sampled_at: string;
};

export type Connection = {
  baseUrl: string;
  token: string;
};