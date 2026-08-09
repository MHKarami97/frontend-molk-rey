import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiFetch, ApiError } from '../lib/api/http';

export type UserRole = 'platform_admin' | 'admin' | 'board_member' | 'resident' | 'owner';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

const ACCESS_TOKEN_KEY = 'molk_rey_access_token';
const USER_KEY = 'molk_rey_current_user';

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
  role: 'admin' | 'resident' | 'owner';
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  const user = ref<AuthUser | null>(readStoredUser());

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const role = computed(() => user.value?.role ?? null);

  function readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  function persist(token: string, u: AuthUser) {
    accessToken.value = token;
    user.value = u;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  async function login(phone: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      const result = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ phone, password }),
      });
      persist(result.accessToken, result.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e instanceof ApiError ? e.message : 'ورود ناموفق بود.' };
    }
  }

  /**
   * register: ثبت‌نام عمومی (Self-Signup)؛ بعد از موفقیت، دقیقاً مثل login
   * کاربر را Persist می‌کند (Auto-Login سمت سرور هم انجام شده است).
   */
  async function register(input: RegisterInput): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      const result = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        auth: false,
        body: JSON.stringify(input),
      });
      persist(result.accessToken, result.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e instanceof ApiError ? e.message : 'ثبت‌نام ناموفق بود.' };
    }
  }

  async function logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // خطای لاگ‌اوت سمت سرور نباید مانع پاک‌شدن وضعیت لوکال شود
    }
    accessToken.value = null;
    user.value = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getHomeRouteForRole(r: UserRole | null): string {
    switch (r) {
      case 'platform_admin':
        return '/platform/subscriptions';
      case 'admin':
      case 'board_member':
        return '/admin/buildings';
      case 'resident':
      case 'owner':
        return '/resident/home';
      default:
        return '/';
    }
  }

  return { accessToken, user, isAuthenticated, role, login, register, logout, getHomeRouteForRole };
});
