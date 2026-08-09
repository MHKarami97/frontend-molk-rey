<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useAdminStore } from '../../stores/useAdminStore';
import ConfirmModal from '../../components/common/ConfirmModal.vue';

interface Notice {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

const store = useAdminStore();
const items = ref<Notice[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showForm = ref(false);
const form = ref({ title: '', body: '' });
const deleteId = ref<string | null>(null);

async function load() {
  if (!store.selectedBuildingId) return;
  isLoading.value = true;
  error.value = null;
  try {
    items.value = await apiFetch<Notice[]>(`/admin/notices?buildingId=${store.selectedBuildingId}`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت اعلامیه‌ها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(load);

const preview = computed(() => form.value.body.split('\n').filter(Boolean));

async function submit() {
  if (!store.selectedBuildingId) return;
  await apiFetch('/admin/notices', {
    method: 'POST',
    body: JSON.stringify({ ...form.value, buildingId: store.selectedBuildingId }),
  });
  showForm.value = false;
  form.value = { title: '', body: '' };
  await load();
}

async function confirmDelete() {
  if (!deleteId.value) return;
  await apiFetch(`/admin/notices/${deleteId.value}`, { method: 'DELETE' });
  deleteId.value = null;
  await load();
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-heading text-ink">اعلامیه‌ها</h1>
      <button class="rounded-control bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark" @click="showForm = true">
        + اعلامیه جدید
      </button>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="items.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      هنوز اعلامیه‌ای ثبت نشده است.
    </p>

    <div v-else class="space-y-2">
      <div v-for="notice in items" :key="notice.id" class="rounded-card border border-surface-border bg-surface p-4">
        <div class="flex items-start justify-between">
          <p class="text-heading text-ink">{{ notice.title }}</p>
          <button class="text-xs text-danger hover:underline" @click="deleteId = notice.id">حذف</button>
        </div>
        <p class="mt-1 whitespace-pre-line text-sm text-ink/70">{{ notice.body }}</p>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <form class="w-full max-w-md space-y-3 rounded-card border border-surface-border bg-surface p-4" @submit.prevent="submit">
            <p class="text-heading text-ink">اعلامیه جدید</p>

            <div>
              <label class="mb-1 block text-xs text-ink/60">عنوان</label>
              <input v-model="form.title" placeholder="عنوان اعلامیه" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>

            <div>
              <label class="mb-1 block text-xs text-ink/60">متن اعلامیه</label>
              <textarea v-model="form.body" rows="4" placeholder="متن کامل اعلامیه" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>

            <div v-if="preview.length > 0" class="rounded-control border border-dashed border-surface-border bg-secondary/40 p-2 text-xs text-ink/70">
              <p class="mb-1 text-label">پیش‌نمایش:</p>
              <p v-for="(line, i) in preview" :key="i">{{ line }}</p>
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-control border border-surface-border px-3 py-1.5 text-sm" @click="showForm = false">انصراف</button>
              <button type="submit" class="rounded-control bg-primary px-3 py-1.5 text-sm text-white">ثبت</button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      :open="!!deleteId"
      title="حذف اعلامیه"
      description="این اعلامیه برای همیشه حذف می‌شود."
      confirm-label="حذف"
      danger
      @confirm="confirmDelete"
      @cancel="deleteId = null"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
