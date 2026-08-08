import { ref, onMounted } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SESSION_DISMISS_KEY = 'molk_rey_install_prompt_dismissed';

/**
 * useInstallPrompt: مرورگر به‌صورت پیش‌فرض یک Banner نصب نمایش می‌دهد؛
 * با preventDefault روی beforeinstallprompt، آن را متوقف و به‌جایش دکمه
 * سفارشی طبق زبان طراحی مرحله ۱ نمایش می‌دهیم.
 *
 * محدودیت مهم: این Event در iOS Safari اصلاً Fire نمی‌شود (Safari از
 * beforeinstallprompt پشتیبانی نمی‌کند)؛ کاربران iOS باید از مسیر دستی
 * «Add to Home Screen» در منوی Share استفاده کنند.
 */
export function useInstallPrompt() {
  const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
  const isInstallable = ref(false);
  const isDismissed = ref(sessionStorage.getItem(SESSION_DISMISS_KEY) === '1');

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt.value = event as BeforeInstallPromptEvent;
      isInstallable.value = !isDismissed.value;
    });

    window.addEventListener('appinstalled', () => {
      isInstallable.value = false;
      deferredPrompt.value = null;
    });
  });

  async function promptInstall() {
    if (!deferredPrompt.value) return;
    await deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
    isInstallable.value = false;
  }

  function dismiss() {
    isInstallable.value = false;
    isDismissed.value = true;
    sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
  }

  return { isInstallable, promptInstall, dismiss };
}
