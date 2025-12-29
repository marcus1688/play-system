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

const enableTimePicker = computed(() => {
  if (!inputValue.value) return false;
  const selectedDate = moment(inputValue.value).tz(TIMEZONE);
  const today = moment().tz(TIMEZONE);
  return selectedDate.isSame(today, "day");
});

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

  if (props.isStartDate) {
    if (props.otherDate) {
      const endMoment = moment(props.otherDate).tz(TIMEZONE);
      const todayMoment = moment().tz(TIMEZONE);
      return endMoment.isAfter(todayMoment) ? today : props.otherDate;
    }
    return today;
  } else {
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

  const selectedMoment = moment(newValue).tz(TIMEZONE);
  const today = moment().tz(TIMEZONE);

  if (!selectedMoment.isSame(today, "day")) {
    if (props.isStartDate) {
      selectedMoment.startOf("day");
    } else {
      selectedMoment.endOf("day");
    }
  }

  emit("update:modelValue", selectedMoment.toDate());

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

  const m = moment(date).tz(TIMEZONE);
  const today = moment().tz(TIMEZONE);

  if (m.isSame(today, "day")) {
    return m.format("DD/MM/YYYY HH:mm");
  }
  return m.format("DD/MM/YYYY");
};
</script>
