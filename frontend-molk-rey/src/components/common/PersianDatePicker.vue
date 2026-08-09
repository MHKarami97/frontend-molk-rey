<script setup lang="ts">
import { ref, computed } from 'vue';
import { toJalali, jalaliToGregorian, toIsoDateString, daysInJalaliMonth, jalaliMonthName } from '../../lib/jalali';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const isOpen = ref(false);
const nowJalali = toJalali(new Date());
const viewYear = ref(nowJalali.jy);
const viewMonth = ref(nowJalali.jm);

const selectedJalali = computed(() => {
  if (!props.modelValue) return null;
  const parsed = new Date(props.modelValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return toJalali(parsed);
});

const monthLabel = computed(() => `${jalaliMonthName(viewMonth.value)} ${viewYear.value}`);

const displayText = computed(() => {
  const s = selectedJalali.value;
  if (!s) return 'انتخاب تاریخ';
  return `${s.jd} ${jalaliMonthName(s.jm)} ${s.jy}`;
});

function openPopover() {
  const s = selectedJalali.value;
  viewYear.value = s ? s.jy : nowJalali.jy;
  viewMonth.value = s ? s.jm : nowJalali.jm;
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

function isSelectedDay(day: number): boolean {
  const s = selectedJalali.value;
  return !!s && s.jy === viewYear.value && s.jm === viewMonth.value && s.jd === day;
}

function pickDay(day: number | null) {
  if (!day) return;
  const gDate = jalaliToGregorian(viewYear.value, viewMonth.value, day);
  emit('update:modelValue', toIsoDateString(gDate));
  closePopover();
}
</script>

<template>
  <div class="relative" dir="rtl">
    <button
      type="button"
      class="w-full rounded-control border border-surface-border bg-surface p-2 text-right text-sm"
      :class="selectedJalali ? 'text-ink' : 'text-ink/50'"
      @click="togglePopover"
    >
      {{ displayText }}
    </button>

    <div v-if="isOpen" class="fixed inset-0 z-40" @click="closePopover" />

    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-64 rounded-card border border-surface-border bg-surface p-3 shadow-overlay"
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
              : isSelectedDay(day)
                ? 'bg-primary text-white'
                : 'text-ink hover:bg-secondary'
          "
          :disabled="day === null"
          @click="pickDay(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>
  </div>
</template>
