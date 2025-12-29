<template>
  <VueDatePicker
    v-model="inputValue"
    :format="format"
    :placeholder="placeholder"
    :enable-time-picker="false"
    :clearable="true"
    :max-date="maxDate"
    auto-apply
    class="w-full"
    :input-class-name="'px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer max-md:px-2 max-md:py-1.5 max-md:text-sm'"
    @update:model-value="handleDateChange"
  />
</template>

<script setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import moment from "moment-timezone";

const TIMEZONE = "Asia/Kuala_Lumpur";

const props = defineProps({
  modelValue: {
    type: [Date, String],
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select Date",
  },
});

const emit = defineEmits(["update:modelValue"]);
const inputValue = ref(props.modelValue);

const maxDate = computed(() => {
  return moment().tz(TIMEZONE).endOf("day").toDate();
});

const isToday = (date) => {
  const today = moment().tz(TIMEZONE);
  const check = moment(date).tz(TIMEZONE);
  return (
    check.date() === today.date() &&
    check.month() === today.month() &&
    check.year() === today.year()
  );
};

const handleDateChange = (newDate) => {
  if (!newDate) {
    emit("update:modelValue", null);
    return;
  }
  const m = moment(newDate).tz(TIMEZONE);
  if (isToday(newDate)) {
    const now = moment().tz(TIMEZONE);
    m.set({
      hour: now.hour(),
      minute: now.minute(),
      second: now.second(),
    });
  } else {
    m.set({ hour: 23, minute: 59, second: 50 });
  }

  emit("update:modelValue", m.toISOString());
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      inputValue.value = moment(newValue).tz(TIMEZONE).toDate();
    } else {
      inputValue.value = null;
    }
  }
);

const format = (date) => {
  if (!date) return "";
  return moment(date).tz(TIMEZONE).format("DD/MM/YYYY");
};
</script>
