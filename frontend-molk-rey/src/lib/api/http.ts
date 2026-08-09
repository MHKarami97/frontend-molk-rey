/**
 * http.ts: کلاینت پایه Fetch با پرتاب خطای یکنواخت (مطابق فرمت error.middleware.ts
 * سمت Backend)، Auto-Refresh خودکار Access Token منقضی‌شده، نمایش خودکار
 * Toast برای هر خطای API، و یک لایه Cache سراسری برای درخواست‌های GET.
 *
 * استراتژی Cache:
 * - هر GET موفق حداکثر GET_CACHE_TTL_MS (پیش‌فرض ۳ دقیقه) در حافظه
 *   نگه داشته می‌شود؛ درخواست بعدی به همان مسیر در همین بازه، بدون رفتن
 *   به شبکه از Cache پاسخ می‌گیرد.
 * - هر درخواست غیر-GET موفق (POST/PUT/PATCH/DELETE) بلافاصله کل Cache
 *   را به‌صورت سراسری پاک می‌کند - چون نمی‌دانیم دقیقاً کدام GET به داده
 *   تغییریافته وابسته بوده، امن‌ترین کار پاک‌کردن همه‌چیز است تا هیچ
 *   صفحه‌ای داده Stale نبیند.
 * - همزمانی: چون خودِ Promise (نه فقط نتیجه نهایی) Cache می‌شود، چند
 *   درخواست هم‌زمان به یک مسیر فقط یک بار واقعاً به شبکه می‌روند.
 */
import { useToastStore } from '../../stores/useToastStore';

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
const ACCESS_TOKEN_KEY = 'molk_rey_access_token';
const USER_KEY = 'molk_rey_current_user';

/** مدت اعتبار هر ورودی Cache (میلی‌ثانیه). پیش‌فرض: ۳ دقیقه. */
const GET_CACHE_TTL_MS = 3 * 60 * 1000;

let refreshPromise: Promise<string | null> | null = null;

interface CacheEntry {
  promise: Promise<unknown>;
  expiresAt: number;
}

/**
 * getCache: کلید = path کامل (شامل querystring). سراسری (ماژول-سطح) است
 * تا بین همه Composable/Store های فرانت مشترک باشد.
 */
const getCache = new Map<string, CacheEntry>();

/**
 * invalidateApiCache: پاک‌سازی دستی کل Cache (مثلاً برای دکمه «بازخوانی»)،
 * بدون نیاز به یک Write واقعی.
 */
export function invalidateApiCache(): void {
  getCache.clear();
}

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function clearAuthAndRedirectToLogin() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  const currentPath = window.location.pathname + window.location.search;
  const isAlreadyOnLogin = window.location.pathname.endsWith('/login');
  if (!isAlreadyOnLogin) {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
}

function notifyError(error: ApiError) {
  try {
    useToastStore().push(error.message, 'danger');
  } catch {
    // Pinia آماده نیست؛ بی‌خطر نادیده گرفته می‌شود
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const body = (await response.json()) as { success: true; data: { accessToken: string } };
        const newToken = body.data.accessToken;
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
        return newToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function performFetch(
  path: string,
  options: RequestInit & { auth?: boolean },
  isRetry: boolean
): Promise<unknown> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? getAccessToken() : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401 && auth && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return performFetch(path, options, true);
    }
    clearAuthAndRedirectToLogin();
    throw new ApiError('SESSION_EXPIRED', 'نشست شما منقضی شده است.', 401);
  }

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorBody;
    const apiError = new ApiError(
      errorBody.error?.code ?? 'UNKNOWN_ERROR',
      errorBody.error?.message ?? 'خطای ناشناخته رخ داد.',
      response.status
    );
    notifyError(apiError);
    throw apiError;
  }

  return body;
}

async function rawFetch(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<unknown> {
  const method = (options.method ?? 'GET').toUpperCase();

  if (method !== 'GET') {
    // هر Write (موفق یا ناموفق) کل Cache را پاک می‌کند تا هیچ صفحه‌ای
    // بعد از تغییر، داده کهنه نبیند.
    try {
      return await performFetch(path, options, false);
    } finally {
      getCache.clear();
    }
  }

  const cached = getCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = performFetch(path, options, false);
  getCache.set(path, { promise, expiresAt: Date.now() + GET_CACHE_TTL_MS });
  // اگر درخواست خطا داد، نتیجه خطا نباید تا پایان TTL در Cache بماند.
  promise.catch(() => getCache.delete(path));
  return promise;
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
