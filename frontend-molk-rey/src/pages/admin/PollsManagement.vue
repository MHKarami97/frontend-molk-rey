<script setup lang="ts">
import { ref } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useAdminStore } from '../../stores/useAdminStore';
import PersianDateTimePicker from '../../components/common/PersianDateTimePicker.vue';

interface PollResult {
  optionId: string;
  optionText: string;
  voteCount: number;
}

const store = useAdminStore();
const question = ref('');
const expiresAt = ref('');
const options = ref<string[]>(['', '']);
const createdPollId = ref<string | null>(null);
const results = ref<PollResult[]>([]);
const isSubmitting = ref(false);
const error = ref<string | null>(null);

function addOption() {
  options.value.push('');
}

function removeOption(index: number) {
  if (options.value.length > 2) options.value.splice(index, 1);
}

async function submit() {
  if (!store.selectedBuildingId) {
    error.value = 'ابتدا یک ساختمان را از منوی کناری انتخاب کنید.';
    return;
  }
  isSubmitting.value = true;
  error.value = null;
  try {
    const created = await apiFetch<{ id: string }>('/admin/polls', {
      method: 'POST',
      body: JSON.stringify({
        buildingId: store.selectedBuildingId,
        question: question.value,
        expiresAt: expiresAt.value,
        options: options.value.filter(Boolean),
      }),
    });
    createdPollId.value = created.id;
    await loadResults();
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'ایجاد رأی‌گیری ناموفق بود.';
  } finally {
    isSubmitting.value = false;
  }
}

async function loadResults() {
  if (!createdPollId.value) return;
  results.value = await apiFetch<PollResult[]>(`/admin/polls/${createdPollId.value}/results`);
}

const maxVotes = () => Math.max(1, ...results.value.map((r) => r.voteCount));
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-heading text-ink">ایجاد رأی‌گیری</h1>

    <form v-if="!createdPollId" class="space-y-3 rounded-card border border-surface-border bg-surface p-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-xs text-ink/60">سؤال رأی‌گیری</label>
        <input
          v-model="question"
          placeholder="سؤال رأی‌گیری"
          class="w-full rounded-control border border-surface-border p-2 text-sm"
          required
        />
      </div>

      <div>
        <label class="mb-1 block text-xs text-ink/60">تاریخ و ساعت پایان (شمسی)</label>
        <PersianDateTimePicker v-model="expiresAt" />
      </div>

      <div v-for="(option, i) in options" :key="i">
        <label class="mb-1 block text-xs text-ink/60">{{ `گزینه ${i + 1}` }}</label>
        <div class="flex gap-2">
          <input
            v-model="options[i]"
            :placeholder="`گزینه ${i + 1}`"
            class="flex-1 rounded-control border border-surface-border p-2 text-sm"
            required
          />
          <button v-if="options.length > 2" type="button" class="text-xs text-danger" @click="removeOption(i)">حذف</button>
        </div>
      </div>

      <button type="button" class="text-xs text-primary hover:underline" @click="addOption">+ افزودن گزینه</button>

      <p v-if="error" class="text-sm text-danger">{{ error }}</p>

      <button type="submit" class="w-full rounded-control bg-primary py-2 text-white hover:bg-primary-dark disabled:opacity-50" :disabled="isSubmitting || !expiresAt">
        ایجاد رأی‌گیری
      </button>
    </form>

    <div v-else class="space-y-3">
      <p class="text-heading text-ink">{{ question }}</p>
      <div v-for="result in results" :key="result.optionId" class="space-y-1">
        <div class="flex justify-between text-sm text-ink/70">
          <span>{{ result.optionText }}</span>
          <span>{{ result.voteCount }} رأی</span>
        </div>
        <div class="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            class="h-full bg-primary transition-all duration-300"
            :style="{ width: `${(result.voteCount / maxVotes()) * 100}%` }"
          />
        </div>
      </div>

      <button class="text-xs text-primary hover:underline" @click="loadResults">به‌روزرسانی نتایج</button>
    </div>
  </div>
</template>
