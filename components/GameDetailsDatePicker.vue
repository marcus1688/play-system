<template>
  <VueDatePicker
    v-model="inputValue"
    :format="format"
    :placeholder="placeholder"
    :enable-time-picker="enableTimePicker"
    :clearable="true"
    :min-date="minDate"
    :max-date="maxDate"
    auto-apply
    :model-type="'timestamp'"
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

const inputValue = ref(props.modelValue);

const enableTimePicker = computed(() => {
  if (!inputValue.value) return false;
  const selectedDate = moment(inputValue.value).tz("Asia/Kuala_Lumpur");
  const today = moment().tz("Asia/Kuala_Lumpur");
  return selectedDate.isSame(today, "day");
});

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
  if (props.isStartDate) {
    if (props.otherDate) {
      const endDate = new Date(props.otherDate);
      if (endDate.getTime() >= today.getTime()) {
        return today;
      }
      return endDate;
    }
    return today;
  } else {
    if (props.otherDate) {
      const startDate = new Date(props.otherDate);
      if (startDate.getTime() < today.getTime()) {
        return today;
      }
    }
    return today;
  }
});

const handleDateChange = (newValue) => {
  if (!newValue) {
    emit("update:modelValue", null);
    if (props.isStartDate && props.otherDate) {
      emit("update:otherDate", null);
    }
    return;
  }
  const date = new Date(newValue);
  const selectedMoment = moment(date).tz("Asia/Kuala_Lumpur");
  const today = moment().tz("Asia/Kuala_Lumpur");
  if (!selectedMoment.isSame(today, "day")) {
    if (props.isStartDate) {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }
  }
  emit("update:modelValue", date);
  if (props.isStartDate && props.otherDate) {
    emit("update:otherDate", null);
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
  const selectedMoment = moment(date).tz("Asia/Kuala_Lumpur");
  const today = moment().tz("Asia/Kuala_Lumpur");
  if (selectedMoment.isSame(today, "day")) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

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
