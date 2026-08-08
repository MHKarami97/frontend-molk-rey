import { ref } from 'vue';
import { apiFetch, ApiError } from '../lib/api/http';
import type { UploadStage } from '../types/receipt.types';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;

/**
 * فشرده‌سازی سمت کلاینت با Canvas API قبل از آپلود؛ برای اتصال اینترنت
 * ضعیف، حجم تصویر رسید (که معمولاً از دوربین موبایل چند مگابایت است)
 * به‌طور محسوس کاهش می‌یابد.
 */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

interface UploadUrlResponse {
  receiptId: string;
  uploadUrl: string;
  expiresAt: string;
}

/**
 * useReceiptUpload: کل چرخه آپلود رسید — فشرده‌سازی → دریافت Presigned URL →
 * PUT مستقیم به R2 → Confirm-upload. با پشتیبانی Retry روی مرحله آپلود.
 */
export function useReceiptUpload(billId: string) {
  const stage = ref<UploadStage>('idle');
  const progress = ref(0);
  const errorMessage = ref<string | null>(null);
  const previewUrl = ref<string | null>(null);

  let lastCompressedBlob: Blob | null = null;

  async function selectFile(file: File) {
    errorMessage.value = null;
    stage.value = 'compressing';
    previewUrl.value = URL.createObjectURL(file);

    try {
      lastCompressedBlob = await compressImage(file);
    } catch {
      lastCompressedBlob = file;
    }

    stage.value = 'idle';
  }

  function uploadWithProgress(url: string, blob: Blob, contentType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          progress.value = Math.round((event.loaded / event.total) * 100);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error('آپلود به فضای ذخیره‌سازی ناموفق بود.'));
      };
      xhr.onerror = () => reject(new Error('خطای شبکه هنگام آپلود.'));

      xhr.send(blob);
    });
  }

  async function upload(): Promise<boolean> {
    if (!lastCompressedBlob) {
      errorMessage.value = 'ابتدا یک تصویر انتخاب کنید.';
      stage.value = 'error';
      return false;
    }

    stage.value = 'uploading';
    progress.value = 0;
    errorMessage.value = null;

    try {
      const contentType = 'image/jpeg';
      const { receiptId, uploadUrl } = await apiFetch<UploadUrlResponse>('/receipts/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          billId,
          contentType,
          fileSizeBytes: lastCompressedBlob.size,
        }),
      });

      await uploadWithProgress(uploadUrl, lastCompressedBlob, contentType);

      await apiFetch(`/receipts/${receiptId}/confirm-upload`, { method: 'POST' });

      stage.value = 'success';
      return true;
    } catch (e) {
      errorMessage.value = e instanceof ApiError ? e.message : 'آپلود رسید ناموفق بود.';
      stage.value = 'error';
      return false;
    }
  }

  function retry() {
    return upload();
  }

  return { stage, progress, errorMessage, previewUrl, selectFile, upload, retry };
}
