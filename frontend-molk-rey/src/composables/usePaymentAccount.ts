import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../lib/api/http';
import type { PaymentAccount } from '../types/receipt.types';

/**
 * usePaymentAccount: مدیریت Fetch لیست شماره‌کارت‌های فعال یک ساختمان
 * به‌همراه وضعیت Loading/Error استاندارد برای مصرف در PaymentCardDisplay.
 */
export function usePaymentAccount(buildingId: string) {
  const accounts = ref<PaymentAccount[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAccounts() {
    isLoading.value = true;
    error.value = null;

    try {
      accounts.value = await apiFetch<PaymentAccount[]>(`/payment-accounts/${buildingId}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'خطا در دریافت شماره حساب‌ها.';
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(fetchAccounts);

  return { accounts, isLoading, error, refetch: fetchAccounts };
}
