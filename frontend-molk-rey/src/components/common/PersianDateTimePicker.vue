<script setup lang="ts">
import { ref, computed } from 'vue';
import { toJalali, jalaliToGregorian, daysInJalaliMonth, jalaliMonthName } from '../../lib/jalali';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const isOpen = ref(false);
const nowJalali = toJalali(new Date());
const viewYear = ref(nowJalali.jy);
const viewMonth = ref(nowJalali.jm);
const selectedDay = ref<number | null>(null);
const selectedHour = ref(0);
const selectedMinute = ref(0);

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const parsedModel = computed(() => {
  if (!props.modelValue) return null;
  const parsed = new Date(props.modelValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
});

const monthLabel = computed(() => `${jalaliMonthName(viewMonth.value)} ${viewYear.value}`);

const displayText = computed(() => {
  const p = parsedModel.value;
  if (!p) return 'انتخاب تاریخ و ساعت';
  const j = toJalali(p);
  return `${j.jd} ${jalaliMonthName(j.jm)} ${j.jy} - ${pad(p.getHours())}:${pad(p.getMinutes())}`;
});

function openPopover() {
  const p = parsedModel.value;
  const base = p ? toJalali(p) : nowJalali;
  viewYear.value = base.jy;
  viewMonth.value = base.jm;
  selectedDay.value = p ? base.jd : null;
  selectedHour.value = p ? p.getHours() : 0;
  selectedMinute.value = p ? p.getMinutes() : 0;
  isOpen.value = true;
}
function closePopover() {
  isOpen.value = false;
}
function togglePopover() {
  if (isOpen.value) closePopover();
  else openPopover();
}

function prevMonth() {
  if (viewMonth.value === 1) {
    viewMonth.value = 12;
    viewYear.value -= 1;
  } else {
    viewMonth.value -= 1;
  }
}
function nextMonth() {
  if (viewMonth.value === 12) {
    viewMonth.value = 1;
    viewYear.value += 1;
  } else {
    viewMonth.value += 1;
  }
}

const weekDayLabels = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const gridCells = computed<(number | null)[]>(() => {
  const firstOfMonthGregorian = jalaliToGregorian(viewYear.value, viewMonth.value, 1);
  const leading = (firstOfMonthGregorian.getDay() + 1) % 7;
  const count = daysInJalaliMonth(viewYear.value, viewMonth.value);
  const cells: (number | null)[] = Array.from({ length: leading }, () => null);
  for (let d = 1; d <= count; d += 1) cells.push(d);
  return cells;
});

function selectDay(day: number | null) {
  if (!day) return;
  selectedDay.value = day;
}

const hourOptions = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = [0, 15, 30, 45];

function confirmSelection() {
  if (!selectedDay.value) return;
  const gDate = jalaliToGregorian(viewYear.value, viewMonth.value, selectedDay.value);
  const iso = `${gDate.getFullYear()}-${pad(gDate.getMonth() + 1)}-${pad(gDate.getDate())}T${pad(selectedHour.value)}:${pad(selectedMinute.value)}`;
  emit('update:modelValue', iso);
  closePopover();
}
</script>

<template>
  <div class="relative" dir="rtl">
    <button
      type="button"
      class="w-full rounded-control border border-surface-border bg-surface p-2 text-right text-sm"
      :class="parsedModel ? 'text-ink' : 'text-ink/50'"
      @click="togglePopover"
    >
      {{ displayText }}
    </button>

    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closePopover" />

    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-72 rounded-card border border-surface-border bg-surface p-3 shadow-overlay"
    >
      <div class="mb-2 flex items-center justify-between">
        <button type="button" class="rounded-control px-2 py-1 text-sm hover:bg-secondary" @click="prevMonth">‹</button>
        <p class="text-sm text-ink">{{ monthLabel }}</p>
        <button type="button" class="rounded-control px-2 py-1 text-sm hover:bg-secondary" @click="nextMonth">›</button>
      </div>

      <div class="grid grid-cols-7 gap-1 text-center text-[10px] text-ink/50">
        <span v-for="label in weekDayLabels" :key="label">{{ label }}</span>
      </div>

      <div class="mt-1 grid grid-cols-7 gap-1">
        <button
          v-for="(day, i) in gridCells"
          :key="i"
          type="button"
          class="h-8 rounded-control text-xs transition"
          :class="
            day === null
              ? 'invisible'
              : selectedDay === day
                ? 'bg-primary text-white'
                : 'text-ink hover:bg-secondary'
          "
          :disabled="day === null"
          @click="selectDay(day)"
        >
          {{ day }}
        </button>
      </div>

      <div class="mt-3 flex items-center gap-2 border-t border-surface-border pt-3">
        <select v-model.number="selectedHour" aria-label="ساعت" class="flex-1 rounded-control border border-surface-border p-1.5 text-xs">
          <option v-for="h in hourOptions" :key="h" :value="h">{{ pad(h) }}</option>
        </select>
        <span class="text-xs text-ink/50">:</span>
        <select v-model.number="selectedMinute" aria-label="دقیقه" class="flex-1 rounded-control border border-surface-border p-1.5 text-xs">
          <option v-for="m in minuteOptions" :key="m" :value="m">{{ pad(m) }}</option>
        </select>
        <button
          type="button"
          class="shrink-0 rounded-control bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-50"
          :disabled="!selectedDay"
          @click="confirmSelection"
        >
          تأیید
        </button>
      </div>
    </div>
  </div>
</template>
