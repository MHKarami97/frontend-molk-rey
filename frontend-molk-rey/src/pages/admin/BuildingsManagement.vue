<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useAdminStore } from '../../stores/useAdminStore';
import ConfirmModal from '../../components/common/ConfirmModal.vue';

interface Unit {
  id: string;
  buildingId: string;
  area: number;
  floor: number;
  ownerId: string;
  residentId: string | null;
}

const store = useAdminStore();
const units = ref<Unit[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const showBuildingForm = ref(false);
const buildingForm = ref({ name: '', address: '', totalUnits: 1 });

const showUnitForm = ref(false);
const unitForm = ref({ area: 50, floor: 1, ownerPhone: '', ownerName: '', ownerPassword: '' });

const deleteTarget = ref<{ type: 'unit'; id: string } | null>(null);

async function loadUnits() {
  if (!store.selectedBuildingId) return;
  isLoading.value = true;
  error.value = null;
  try {
    units.value = await apiFetch<Unit[]>(`/admin/units?buildingId=${store.selectedBuildingId}`);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت واحدها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchBuildings();
  await loadUnits();
});

async function submitBuilding() {
  await apiFetch('/admin/buildings', { method: 'POST', body: JSON.stringify(buildingForm.value) });
  showBuildingForm.value = false;
  buildingForm.value = { name: '', address: '', totalUnits: 1 };
  await store.fetchBuildings();
}

async function submitUnit() {
  if (!store.selectedBuildingId) return;
  await apiFetch('/admin/units', {
    method: 'POST',
    body: JSON.stringify({
      buildingId: store.selectedBuildingId,
      area: unitForm.value.area,
      floor: unitForm.value.floor,
      newOwner: {
        name: unitForm.value.ownerName,
        phone: unitForm.value.ownerPhone,
        password: unitForm.value.ownerPassword,
      },
    }),
  });
  showUnitForm.value = false;
  unitForm.value = { area: 50, floor: 1, ownerPhone: '', ownerName: '', ownerPassword: '' };
  await loadUnits();
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  await apiFetch(`/admin/units/${deleteTarget.value.id}`, { method: 'DELETE' });
  deleteTarget.value = null;
  await loadUnits();
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-heading text-ink">مدیریت ساختمان و واحدها</h1>
      <div class="flex gap-2">
        <button
          class="rounded-control border border-surface-border px-3 py-1.5 text-sm hover:bg-secondary"
          @click="showBuildingForm = true"
        >
          + ساختمان جدید
        </button>
        <button
          class="rounded-control bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-dark"
          :disabled="!store.selectedBuildingId"
          @click="showUnitForm = true"
        >
          + واحد جدید
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-16 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="units.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      هنوز واحدی برای این ساختمان ثبت نشده است. با دکمه «+ واحد جدید» شروع کنید.
    </p>

    <table v-else class="hidden w-full overflow-hidden rounded-card border border-surface-border bg-surface text-sm sm:table">
      <thead class="bg-secondary/60 text-label text-ink/70">
        <tr>
          <th class="p-3 text-right">طبقه</th>
          <th class="p-3 text-right">متراژ</th>
          <th class="p-3 text-right">مالک</th>
          <th class="p-3 text-right">عملیات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="unit in units" :key="unit.id" class="border-t border-surface-border">
          <td class="p-3">{{ unit.floor }}</td>
          <td class="p-3">{{ unit.area }} متر</td>
          <td class="p-3 text-xs text-ink/60">{{ unit.ownerId }}</td>
          <td class="p-3">
            <button class="text-xs text-danger hover:underline" @click="deleteTarget = { type: 'unit', id: unit.id }">
              حذف
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="units.length > 0" class="space-y-2 sm:hidden">
      <div v-for="unit in units" :key="unit.id" class="rounded-card border border-surface-border bg-surface p-3">
        <p class="text-heading text-ink">طبقه {{ unit.floor }} — {{ unit.area }} متر</p>
        <p class="mt-1 text-xs text-ink/60">مالک: {{ unit.ownerId }}</p>
        <button class="mt-2 text-xs text-danger hover:underline" @click="deleteTarget = { type: 'unit', id: unit.id }">
          حذف واحد
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBuildingForm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <form class="w-full max-w-sm space-y-3 rounded-card border border-surface-border bg-surface p-4" @submit.prevent="submitBuilding">
            <p class="text-heading text-ink">ساختمان جدید</p>

            <div>
              <label class="mb-1 block text-xs text-ink/60">نام ساختمان</label>
              <input v-model="buildingForm.name" placeholder="مثلاً برج ری" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-xs text-ink/60">آدرس</label>
              <input v-model="buildingForm.address" placeholder="آدرس کامل ساختمان" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-xs text-ink/60">تعداد واحد</label>
              <input v-model.number="buildingForm.totalUnits" type="number" min="1" placeholder="مثلاً ۱۲" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-control border border-surface-border px-3 py-1.5 text-sm" @click="showBuildingForm = false">انصراف</button>
              <button type="submit" class="rounded-control bg-primary px-3 py-1.5 text-sm text-white">ثبت</button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUnitForm" class="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <form class="w-full max-w-sm space-y-3 rounded-card border border-surface-border bg-surface p-4" @submit.prevent="submitUnit">
            <p class="text-heading text-ink">واحد جدید</p>

            <div>
              <label class="mb-1 block text-xs text-ink/60">طبقه</label>
              <input v-model.number="unitForm.floor" type="number" placeholder="مثلاً ۳" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-xs text-ink/60">متراژ (متر مربع)</label>
              <input v-model.number="unitForm.area" type="number" placeholder="مثلاً ۸۵" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-xs text-ink/60">نام مالک</label>
              <input v-model="unitForm.ownerName" placeholder="نام و نام خانوادگی مالک" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-xs text-ink/60">شماره تلفن مالک</label>
              <input v-model="unitForm.ownerPhone" placeholder="09xxxxxxxxx" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>
            <div>
              <label class="mb-1 block text-xs text-ink/60">رمز عبور اولیه مالک</label>
              <input v-model="unitForm.ownerPassword" type="password" placeholder="حداقل ۸ کاراکتر" class="w-full rounded-control border border-surface-border p-2 text-sm" required />
            </div>

            <div class="flex justify-end gap-2">
              <button type="button" class="rounded-control border border-surface-border px-3 py-1.5 text-sm" @click="showUnitForm = false">انصراف</button>
              <button type="submit" class="rounded-control bg-primary px-3 py-1.5 text-sm text-white">ثبت</button>
            </div>
          </form>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      :open="!!deleteTarget"
      title="حذف واحد"
      description="این عملیات غیرقابل بازگشت است. آیا مطمئن هستید؟"
      confirm-label="حذف"
      danger
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
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
