<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  toJalali,
  jalaliToGregorian,
  toIsoDateString,
  daysInJalaliMonth,
  PERSIAN_MONTHS,
} from "../../lib/jalali";
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();
const now = toJalali(new Date());
const years = Array.from({ length: 8 }, (_, i) => now.jy + 3 - i);
const year = ref<number | "">("");
const month = ref<number | "">("");
const day = ref<number | "">("");
function sync() {
  if (!props.modelValue) {
    year.value = month.value = day.value = "";
    return;
  }
  const value = toJalali(new Date(props.modelValue));
  year.value = value.jy;
  month.value = value.jm;
  day.value = value.jd;
}
watch(() => props.modelValue, sync, { immediate: true });
const days = computed(() =>
  Array.from(
    {
      length:
        year.value && month.value
          ? daysInJalaliMonth(year.value, month.value)
          : 31,
    },
    (_, i) => i + 1,
  ),
);
function change() {
  if (year.value && month.value && day.value)
    emit(
      "update:modelValue",
      toIsoDateString(jalaliToGregorian(year.value, month.value, day.value)),
    );
}
</script>
<template>
  <div class="grid grid-cols-3 gap-2" dir="rtl">
    <select
      v-model="day"
      aria-label="روز"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="change"
    >
      <option value="" disabled>روز</option>
      <option v-for="value in days" :key="value" :value="value">
        {{ value }}
      </option></select
    ><select
      v-model="month"
      aria-label="ماه"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="change"
    >
      <option value="" disabled>ماه</option>
      <option
        v-for="(value, index) in PERSIAN_MONTHS"
        :key="value"
        :value="index + 1"
      >
        {{ value }}
      </option></select
    ><select
      v-model="year"
      aria-label="سال"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="change"
    >
      <option value="" disabled>سال</option>
      <option v-for="value in years" :key="value" :value="value">
        {{ value }}
      </option>
    </select>
  </div>
</template>
