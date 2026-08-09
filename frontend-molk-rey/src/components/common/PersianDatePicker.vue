<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { toJalali, jalaliToGregorian, toIsoDateString, daysInJalaliMonth, PERSIAN_MONTHS } from '../../lib/jalali';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const nowJalali = toJalali(new Date());
const years = Array.from({ length: 8 }, (_, i) => nowJalali.jy + 3 - i);

const selectedYear = ref<number | ''>('');
const selectedMonth = ref<number | ''>('');
const selectedDay = ref<number | ''>('');

function syncFromModelValue() {
  if (!props.modelValue) {
    selectedYear.value = '';
    selectedMonth.value = '';
    selectedDay.value = '';
    return;
  }
  const parsed = new Date(props.modelValue);
  if (Number.isNaN(parsed.getTime())) return;
  const { jy, jm, jd } = toJalali(parsed);
  selectedYear.value = jy;
  selectedMonth.value = jm;
  selectedDay.value = jd;
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true });

const dayOptions = computed(() => {
  if (!selectedYear.value || !selectedMonth.value) return Array.from({ length: 31 }, (_, i) => i + 1);
  const count = daysInJalaliMonth(selectedYear.value, selectedMonth.value);
  return Array.from({ length: count }, (_, i) => i + 1);
});

function emitIfComplete() {
  if (selectedYear.value && selectedMonth.value && selectedDay.value) {
    const gDate = jalaliToGregorian(selectedYear.value, selectedMonth.value, selectedDay.value);
    emit('update:modelValue', toIsoDateString(gDate));
  }
}
</script>

<template>
  <div class="grid grid-cols-3 gap-2" dir="rtl">
    <select
      v-model="selectedDay"
      aria-label="روز"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="emitIfComplete"
    >
      <option value="" disabled>روز</option>
      <option v-for="d in dayOptions" :key="d" :value="d">{{ d }}</option>
    </select>
    <select
      v-model="selectedMonth"
      aria-label="ماه"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="emitIfComplete"
    >
      <option value="" disabled>ماه</option>
      <option v-for="(m, i) in PERSIAN_MONTHS" :key="i" :value="i + 1">{{ m }}</option>
    </select>
    <select
      v-model="selectedYear"
      aria-label="سال"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="emitIfComplete"
    >
      <option value="" disabled>سال</option>
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
    </select>
  </div>
</template>
