<template>
  <VueDatePicker
    v-model="inputValue"
    :format="format"
    :placeholder="placeholder"
    :enable-time-picker="true"
    :clearable="true"
    :min-date="minDate"
    :max-date="maxDate"
    auto-apply
    :start-time="
      props.isStartDate
        ? { hours: 0, minutes: 0, seconds: 0 }
        : { hours: 23, minutes: 59, seconds: 59 }
    "
    class="w-full"
    :input-class-name="'px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer'"
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
    type: Date,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select Date",
  },
  isStartDate: {
    type: Boolean,
    default: false,
  },
  otherDate: {
    type: Date,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "update:otherDate"]);
const inputValue = ref(props.modelValue);

const minDate = computed(() => {
  if (props.isStartDate && props.otherDate) {
    return moment(props.otherDate).tz(TIMEZONE).subtract(1, "year").toDate();
  } else if (!props.isStartDate && props.otherDate) {
    return props.otherDate;
  }
  return undefined;
});

const maxDate = computed(() => {
  const today = moment().tz(TIMEZONE).endOf("day").toDate();
  if (props.isStartDate && props.otherDate) {
    const otherMoment = moment(props.otherDate).tz(TIMEZONE);
    return otherMoment.isAfter(today) ? today : props.otherDate;
  } else if (!props.isStartDate && props.otherDate) {
    const max = moment(props.otherDate).tz(TIMEZONE).add(1, "year").toDate();
    return moment(max).isAfter(today) ? today : max;
  }
  return today;
});

const handleDateChange = (newDate) => {
  if (!newDate) {
    emit("update:modelValue", null);
    return;
  }
  emit("update:modelValue", moment(newDate).tz(TIMEZONE).toDate());
};

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

const format = (date) => {
  if (!date) return "";
  return moment(date).tz(TIMEZONE).format("DD/MM/YYYY HH:mm");
};
</script>
