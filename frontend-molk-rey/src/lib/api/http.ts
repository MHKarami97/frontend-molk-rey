/**
 * http.ts: کلاینت پایه Fetch با پرتاب خطای یکنواخت (مطابق فرمت error.middleware.ts
 * سمت Backend)، به‌همراه Auto-Refresh خودکار Access Token منقضی‌شده و
 * نمایش خودکار Toast برای هر خطای API (حتی اگر صفحه فراخوان try/catch
 * نداشته باشد — قبلاً این خطاها کاملاً بی‌صدا از بین می‌رفتند).
 *
 * سناریوی Auto-Refresh:
 * 1) هر درخواست با Access Token فعلی ارسال می‌شود.
 * 2) اگر پاسخ 401 برگردد (Token منقضی)، یک تلاش (نه بیشتر، برای جلوگیری
 *    از حلقه بی‌نهایت) برای گرفتن Access Token جدید از /auth/refresh
 *    انجام می‌شود (credentials: 'include' چون Refresh Token در httpOnly
 *    Cookie جدا از Origin فرانت‌اند است).
 * 3) اگر Refresh موفق بود، درخواست اصلی یک‌بار با Token جدید تکرار می‌شود.
 * 4) اگر Refresh هم شکست خورد (مثلاً Refresh Token هم منقضی شده)، وضعیت
 *    Auth لوکال پاک و کاربر خودکار به /login هدایت می‌شود.
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

let refreshPromise: Promise<string | null> | null = null;

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

/**
 * notifyError: نمایش خودکار Toast برای هر خطای API. داخل try/catch
 * قرار دارد چون در تئوری اگر Pinia هنوز نصب نشده باشد (مرایماًا در تست‌های
 * واحد ایزوله)، نباید خودِ نمایش خطا باعث خطای جدید شود.
 */
function notifyError(error: ApiError) {
  try {
    useToastStore().push(error.message, 'danger');
  } catch {
    // Pinia آماده نیست؛ بی‌خطر نادیده گرفته می‌شود
  }
}

/**
 * refreshAccessToken: هم‌زمان‌سازی‌شده با یک Promise مشترک، تا اگر چند
 * درخواست هم‌زمان با 401 مواجه شوند، فقط یک بار /auth/refresh صدا زده شود
 * (نه یک درخواست Refresh جدا برای هرکدام).
 */
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

async function rawFetch(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
  isRetry = false
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

  // فقط برای درخواست‌های احراز-هویت‌دار و فقط یک‌بار تلاش برای Refresh
  if (response.status === 401 && auth && !isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return rawFetch(path, options, true);
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
