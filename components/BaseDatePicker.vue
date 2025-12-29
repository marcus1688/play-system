<template>
  <VueDatePicker
    v-model="inputValue"
    :format="format"
    :placeholder="placeholder"
    :enable-time-picker="false"
    :clearable="true"
    :min-date="minDate"
    :max-date="maxDate"
    auto-apply
    :start-time="
      props.isStartDate ? { hours: 0, minutes: 0, seconds: 0 } : undefined
    "
    :end-time="
      !props.isStartDate ? { hours: 23, minutes: 59, seconds: 59 } : undefined
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
const TIMEZONE = "Asia/Kuala_Lumpur";
const inputValue = ref(props.modelValue);
const minDate = computed(() => {
  if (props.isStartDate && props.otherDate) {
    const min = moment(props.otherDate)
      .tz(TIMEZONE)
      .subtract(1, "year")
      .toDate();
    return min;
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
  const m = moment(newDate).tz(TIMEZONE);
  if (props.isStartDate) {
    emit("update:modelValue", m.startOf("day").toDate());
  } else {
    emit("update:modelValue", m.endOf("day").toDate());
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

const format = (date) => {
  if (!date) return "";
  return moment(date).tz(TIMEZONE).format("DD/MM/YYYY");
};
</script>
<style scoped>
.dp__theme_light {
  --dp-background-color: #fff;
  --dp-text-color: #212121;
  --dp-hover-color: #f3f3f3;
  --dp-hover-text-color: #212121;
  --dp-hover-icon-color: #959595;
  --dp-primary-color: #4f46e5;
  --dp-primary-text-color: #fff;
  --dp-secondary-color: #c0c4cc;
  --dp-border-color: #ddd;
  --dp-menu-border-color: #ddd;
  --dp-border-color-hover: #aaaeb7;
  --dp-disabled-color: #f6f6f6;
  --dp-scroll-bar-background: #f3f3f3;
  --dp-scroll-bar-color: #959595;
  --dp-success-color: #76d275;
  --dp-success-color-disabled: #a3d9b1;
  --dp-icon-color: #959595;
  --dp-danger-color: #ff6f60;
}
</style>
