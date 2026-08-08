/**
 * http.ts: کلاینت پایه Fetch با پرتاب خطای یکنواخت (مطابق فرمت error.middleware.ts
 * سمت Backend) تا Composable ها نیازی به تکرار منطق Parse خطا نداشته باشند.
 */
export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function rawFetch(path: string, options: RequestInit & { auth?: boolean } = {}) {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? localStorage.getItem('molk_rey_access_token') : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    throw new ApiError(
      errorBody.error?.code ?? 'UNKNOWN_ERROR',
      errorBody.error?.message ?? 'خطای ناشناخته رخ داد.',
      response.status
    );
  }

  return body;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const body = await rawFetch(path, options);
  return (body as { success: true; data: T }).data;
}

export async function apiFetchPaged<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<{ data: T; nextCursor: string | null }> {
  const body = await rawFetch(path, options);
  const typed = body as { success: true; data: T; pagination?: { nextCursor: string | null } };
  return { data: typed.data, nextCursor: typed.pagination?.nextCursor ?? null };
}
