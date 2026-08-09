<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { toJalali, jalaliToGregorian, daysInJalaliMonth, PERSIAN_MONTHS } from '../../lib/jalali';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const nowJalali = toJalali(new Date());
const years = Array.from({ length: 8 }, (_, i) => nowJalali.jy + 3 - i);

const selectedYear = ref<number | ''>('');
const selectedMonth = ref<number | ''>('');
const selectedDay = ref<number | ''>('');
const selectedHour = ref<number | ''>('');
const selectedMinute = ref<number | ''>('');

function syncFromModelValue() {
  if (!props.modelValue) {
    selectedYear.value = '';
    selectedMonth.value = '';
    selectedDay.value = '';
    selectedHour.value = '';
    selectedMinute.value = '';
    return;
  }
  const parsed = new Date(props.modelValue);
  if (Number.isNaN(parsed.getTime())) return;
  const { jy, jm, jd } = toJalali(parsed);
  selectedYear.value = jy;
  selectedMonth.value = jm;
  selectedDay.value = jd;
  selectedHour.value = parsed.getHours();
  selectedMinute.value = parsed.getMinutes();
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true });

const dayOptions = computed(() => {
  if (!selectedYear.value || !selectedMonth.value) return Array.from({ length: 31 }, (_, i) => i + 1);
  const count = daysInJalaliMonth(selectedYear.value, selectedMonth.value);
  return Array.from({ length: count }, (_, i) => i + 1);
});
const hourOptions = Array.from({ length: 24 }, (_, i) => i);
const minuteOptions = [0, 15, 30, 45];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function emitIfComplete() {
  if (
    selectedYear.value &&
    selectedMonth.value &&
    selectedDay.value &&
    selectedHour.value !== '' &&
    selectedMinute.value !== ''
  ) {
    const gDate = jalaliToGregorian(selectedYear.value, selectedMonth.value, selectedDay.value);
    const iso = `${gDate.getFullYear()}-${pad(gDate.getMonth() + 1)}-${pad(gDate.getDate())}T${pad(
      selectedHour.value as number
    )}:${pad(selectedMinute.value as number)}`;
    emit('update:modelValue', iso);
  }
}
</script>

<template>
  <div class="grid grid-cols-5 gap-2" dir="rtl">
    <select v-model="selectedDay" aria-label="روز" class="rounded-control border border-surface-border p-2 text-sm" @change="emitIfComplete">
      <option value="" disabled>روز</option>
      <option v-for="d in dayOptions" :key="d" :value="d">{{ d }}</option>
    </select>
    <select v-model="selectedMonth" aria-label="ماه" class="rounded-control border border-surface-border p-2 text-sm" @change="emitIfComplete">
      <option value="" disabled>ماه</option>
      <option v-for="(m, i) in PERSIAN_MONTHS" :key="i" :value="i + 1">{{ m }}</option>
    </select>
    <select v-model="selectedYear" aria-label="سال" class="rounded-control border border-surface-border p-2 text-sm" @change="emitIfComplete">
      <option value="" disabled>سال</option>
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
    </select>
    <select v-model="selectedHour" aria-label="ساعت" class="rounded-control border border-surface-border p-2 text-sm" @change="emitIfComplete">
      <option value="" disabled>ساعت</option>
      <option v-for="h in hourOptions" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
    </select>
    <select v-model="selectedMinute" aria-label="دقیقه" class="rounded-control border border-surface-border p-2 text-sm" @change="emitIfComplete">
      <option value="" disabled>دقیقه</option>
      <option v-for="m in minuteOptions" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
    </select>
  </div>
</template>
