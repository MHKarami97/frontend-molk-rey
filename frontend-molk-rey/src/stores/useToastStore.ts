import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'danger' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 1;

/**
 * useToastStore: منبع واحد نمایش خطا/پیام موفقیت به کاربر در سطح کل SPA.
 * lib/api/http.ts مستقیماً از این Store استفاده می‌کند تا هر خطای API -
 * حتی اگر صفحه فراخوان اصلاً try/catch ندارد - به‌طور خودکار به
 * کاربر نمایش داده شود. قبلاً بسیاری از خطاها (مثلاً 400 Validation در
 * فرم‌هایی مثل «ساختمان جدید») کاملاً بی‌صدا از بین می‌رفتند.
 */
export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function push(message: string, type: ToastType = 'info', durationMs = 5000) {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => remove(id), durationMs);
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, push, remove };
});
