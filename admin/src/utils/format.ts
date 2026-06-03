/** Đọc số từ ô input (hỗ trợ 1.234,56 hoặc 1234.56) */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return String(data.message);
  }
  return fallback;
}

export function parseNumberInput(value: string): number {
  const raw = value.trim().replace(/\s/g, '');
  if (!raw) return NaN;
  const normalized = raw.includes(',') && !raw.includes('.')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function field<T>(obj: Record<string, unknown>, snake: string, camel: string): T | undefined {
  if (obj[snake] !== undefined) return obj[snake] as T;
  return obj[camel] as T | undefined;
}

export function unwrapList(res: { data: { data?: unknown } }): unknown[] {
  const body = res.data.data ?? res.data;
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown[] }).data)) {
    return (body as { data: unknown[] }).data;
  }
  return [];
}

export function unwrapData<T>(res: { data: { data?: T } }): T {
  return (res.data.data ?? res.data) as T;
}

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export function unwrapPaginated(res: { data: { data?: unknown } }): {
  data: Record<string, unknown>[];
  meta: PaginationMeta;
} {
  const body = (res.data.data ?? res.data) as Record<string, unknown>;
  const data = Array.isArray(body?.data)
    ? (body.data as Record<string, unknown>[])
    : Array.isArray(body)
      ? (body as Record<string, unknown>[])
      : [];
  const meta = (body?.meta ?? {}) as Record<string, number>;
  return {
    data,
    meta: {
      page: Number(meta.page ?? 1),
      limit: Number(meta.limit ?? data.length),
      total: Number(meta.total ?? data.length),
      total_pages: Number(meta.total_pages ?? meta.totalPages ?? 1),
    },
  };
}
