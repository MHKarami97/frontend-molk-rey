<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { apiFetch, ApiError } from '../../lib/api/http';
import { useResidentStore } from '../../stores/useResidentStore';
import UnitSwitcher from '../../components/resident/UnitSwitcher.vue';

interface Poll {
  id: string;
  question: string;
  expiresAt: string;
}

interface PollResult {
  optionId: string;
  optionText: string;
  voteCount: number;
}

const store = useResidentStore();
const activePolls = ref<Poll[]>([]);
const expiredPolls = ref<Poll[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const votedPollIds = ref<Set<string>>(new Set());
const resultsByPoll = ref<Record<string, PollResult[]>>({});
const selectedOptionByPoll = ref<Record<string, string>>({});

async function load() {
  if (!store.activeUnit) return;
  isLoading.value = true;
  error.value = null;
  try {
    const data = await apiFetch<{ active: Poll[]; expired: Poll[] }>(
      `/resident/polls?buildingId=${store.activeUnit.buildingId}`
    );
    activePolls.value = data.active;
    expiredPolls.value = data.expired;
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'خطا در دریافت رأی‌گیری‌ها.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  await store.fetchUnits();
  await load();
});
watch(() => store.activeUnitId, load);

async function loadResults(pollId: string) {
  resultsByPoll.value[pollId] = await apiFetch<PollResult[]>(`/resident/polls/${pollId}/results`);
}

async function vote(pollId: string) {
  const optionId = selectedOptionByPoll.value[pollId];
  if (!optionId || !store.activeUnitId) return;

  try {
    await apiFetch(`/resident/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ unitId: store.activeUnitId, optionId }),
    });
    votedPollIds.value.add(pollId);
    await loadResults(pollId);
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'ثبت رأی ناموفق بود.';
  }
}

const maxVotes = (pollId: string) => Math.max(1, ...(resultsByPoll.value[pollId] ?? []).map((r) => r.voteCount));
</script>

<template>
  <div class="space-y-6">
    <UnitSwitcher />
    <h1 class="text-heading text-ink">رأی‌گیری‌ها</h1>

    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 2" :key="i" class="h-24 animate-pulse rounded-card border border-surface-border bg-secondary/60" />
    </div>

    <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

    <p
      v-else-if="activePolls.length === 0 && expiredPolls.length === 0"
      class="rounded-card border border-dashed border-surface-border p-8 text-center text-sm text-ink/60"
    >
      رأی‌گیری فعالی برای این ساختمان وجود ندارد.
    </p>

    <div v-for="poll in activePolls" :key="poll.id" class="rounded-card border border-surface-border bg-surface p-4">
      <p class="text-heading text-ink">{{ poll.question }}</p>

      <div v-if="votedPollIds.has(poll.id) && resultsByPoll[poll.id]" class="mt-3 space-y-2">
        <div v-for="result in resultsByPoll[poll.id]" :key="result.optionId" class="space-y-1">
          <div class="flex justify-between text-xs text-ink/70">
            <span>{{ result.optionText }}</span>
            <span>{{ result.voteCount }}</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div class="h-full bg-primary" :style="{ width: `${(result.voteCount / maxVotes(poll.id)) * 100}%` }" />
          </div>
        </div>
      </div>

      <div v-else class="mt-3 space-y-2">
        <button class="text-xs text-primary hover:underline" @click="loadResults(poll.id)">نمایش گزینه‌ها</button>
        <div v-if="resultsByPoll[poll.id]" class="space-y-1">
          <label v-for="option in resultsByPoll[poll.id]" :key="option.optionId" class="flex items-center gap-2 text-sm">
            <input
              type="radio"
              :name="`poll-${poll.id}`"
              :value="option.optionId"
              @change="selectedOptionByPoll[poll.id] = option.optionId"
            />
            {{ option.optionText }}
          </label>
          <button class="mt-2 rounded-control bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary-dark" @click="vote(poll.id)">
            ثبت رأی
          </button>
        </div>
      </div>
    </div>

    <div v-if="expiredPolls.length > 0">
      <p class="mb-2 text-label text-ink/60">رأی‌گیری‌های پایان‌یافته</p>
      <div v-for="poll in expiredPolls" :key="poll.id" class="mb-2 rounded-card border border-surface-border bg-secondary/30 p-3 text-sm text-ink/70">
        {{ poll.question }}
      </div>
    </div>
  </div>
</template>
