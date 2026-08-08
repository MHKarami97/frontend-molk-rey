import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

// نام ریپازیتوری GitHub برای base path صحیح روی GitHub Pages
// (GitHub Pages پروژه را زیر /molk-rey/ سرو می‌کند، نه روی روت دامنه)
const REPO_BASE_PATH = '/';

export default defineConfig({
  base: REPO_BASE_PATH,
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['/icons/*', 'fonts/*.woff2'],
      manifest: {
        id: '/molk-rey/',
        name: 'ملک ری',
        short_name: 'ملک ری',
        description: 'اپلیکیشن مدیریت ساختمان ملک ری',
        lang: 'fa',
        dir: 'rtl',
        start_url: REPO_BASE_PATH,
        scope: REPO_BASE_PATH,
        display: 'standalone',
        // پالت Structured Warmth مرحله ۱ — بدون رنگ جدید
        theme_color: '#B5502F',
        background_color: '#F2E9DE',
        icons: [
          { src: 'icons/icon-48.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-72.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-96.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-144.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'پرداخت شارژ',
            short_name: 'پرداخت',
            url: '/resident/bills',
            icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'ثبت درخواست تعمیر',
            short_name: 'تعمیرات',
            url: '/resident/maintenance',
            icons: [{ src: 'icons/icon-96.png', sizes: '96x96' }],
          },
        ],
      },

      workbox: {
        // صفحه آفلاین اختصاصی به‌جای صفحه پیش‌فرض مرورگر، وقتی هیچ صفحه‌ای
        // در Cache موجود نیست و شبکه هم قطع است.
        navigateFallback: `${REPO_BASE_PATH}offline.html`,
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          // NetworkFirst برای API: همیشه تلاش برای شبکه، fallback به Cache در آفلاین
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'molk-rey-api-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 6 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // CacheFirst برای فونت Vazirmatn (Immutable، تغییر نمی‌کند)
          {
            urlPattern: ({ url }) => /\.woff2?$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'molk-rey-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // CacheFirst برای تصاویر/آیکون‌های استاتیک
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'molk-rey-images-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // StaleWhileRevalidate برای صفحات HTML اصلی: نمایش سریع نسخه Cache
          // شده، در پس‌زمینه به‌روزرسانی می‌شود.
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'molk-rey-pages-cache' },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
