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
    const min = new Date(props.otherDate);
    min.setFullYear(min.getFullYear() - 1);
    return min;
  } else if (!props.isStartDate && props.otherDate) {
    return props.otherDate;
  }
  return undefined;
});
const maxDate = computed(() => {
  const today = new Date();
  if (props.isStartDate && props.otherDate) {
    return new Date(props.otherDate) > today ? today : props.otherDate;
  } else if (!props.isStartDate && props.otherDate) {
    const max = new Date(props.otherDate);
    max.setFullYear(max.getFullYear() + 1);
    return max > today ? today : max;
  }
  return today;
});

const handleDateChange = (newDate) => {
  if (!newDate) {
    emit("update:modelValue", null);
    return;
  }
  if (!props.isStartDate) {
    const adjustedDate = new Date(newDate);
    adjustedDate.setHours(23, 59, 59, 999);
    emit("update:modelValue", adjustedDate);
    if (props.otherDate) {
      emit("update:otherDate", null);
    }
  } else {
    const adjustedDate = new Date(newDate);
    adjustedDate.setHours(0, 0, 0, 0);
    emit("update:modelValue", adjustedDate);
    if (props.otherDate) {
      emit("update:otherDate", null);
    }
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
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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
