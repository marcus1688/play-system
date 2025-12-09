<template>
  <VueDatePicker
    v-model="inputValue"
    :format="format"
    :placeholder="placeholder"
    :enable-time-picker="false"
    :clearable="true"
    :max-date="new Date()"
    auto-apply
    class="w-full"
    :input-class-name="'px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer max-md:px-2 max-md:py-1.5 max-md:text-sm'"
    @update:model-value="handleDateChange"
  />
</template>

<script setup>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

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

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const handleDateChange = (newDate) => {
  if (!newDate) {
    emit("update:modelValue", null);
    return;
  }
  const adjustedDate = new Date(newDate);
  if (isToday(adjustedDate)) {
    const now = new Date();
    adjustedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  } else {
    adjustedDate.setHours(23, 59, 50, 0);
  }
  emit("update:modelValue", adjustedDate.toISOString());
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      inputValue.value = new Date(newValue);
    } else {
      inputValue.value = null;
    }
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
