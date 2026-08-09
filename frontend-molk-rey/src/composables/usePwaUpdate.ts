import { useRegisterSW } from 'virtual:pwa-register/vue';

/**
 * usePwaUpdate: لایه نازک روی useRegisterSW برای هماهنگی با registerType:
 * 'prompt'. هر ۶۰ دقیقه یک‌بار (onRegisteredSW) بررسی می‌کند که آیا نسخه
 * جدید Service Worker منتشر شده؛ اگر بله، needRefresh=true می‌شود و
 * UpdateAvailableBanner.vue پیام را نمایش می‌دهد.
 */
export function usePwaUpdate() {
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    },
  });

  async function applyUpdate() {
    // reloadPage=true: بعد از فعال‌شدن Service Worker جدید، صفحه خودکار
    // Reload می‌شود تا نسخه جدید اپلیکیشن واقعاً بار شود.
    await updateServiceWorker(true);
  }

  function dismissOfflineReady() {
    offlineReady.value = false;
  }

  return { needRefresh, offlineReady, applyUpdate, dismissOfflineReady };
}
