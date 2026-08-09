<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  toJalali,
  jalaliToGregorian,
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
const hour = ref<number | "">("");
const minute = ref<number | "">("");
function sync() {
  if (!props.modelValue) {
    year.value = month.value = day.value = hour.value = minute.value = "";
    return;
  }
  const date = new Date(props.modelValue);
  const value = toJalali(date);
  year.value = value.jy;
  month.value = value.jm;
  day.value = value.jd;
  hour.value = date.getHours();
  minute.value = date.getMinutes();
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
const pad = (value: number) => String(value).padStart(2, "0");
function change() {
  if (
    year.value &&
    month.value &&
    day.value &&
    hour.value !== "" &&
    minute.value !== ""
  ) {
    const date = jalaliToGregorian(year.value, month.value, day.value);
    emit(
      "update:modelValue",
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour.value as number)}:${pad(minute.value as number)}`,
    );
  }
}
</script>
<template>
  <div class="grid grid-cols-5 gap-2" dir="rtl">
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
      </option></select
    ><select
      v-model="hour"
      aria-label="ساعت"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="change"
    >
      <option value="" disabled>ساعت</option>
      <option v-for="value in 24" :key="value" :value="value - 1">
        {{ String(value - 1).padStart(2, "0") }}
      </option></select
    ><select
      v-model="minute"
      aria-label="دقیقه"
      class="rounded-control border border-surface-border p-2 text-sm"
      @change="change"
    >
      <option value="" disabled>دقیقه</option>
      <option v-for="value in [0, 15, 30, 45]" :key="value" :value="value">
        {{ String(value).padStart(2, "0") }}
      </option>
    </select>
  </div>
</template>
