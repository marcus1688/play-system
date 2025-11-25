<template>
  <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
    <h2
      class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
    >
      {{ $t("schedule_settings") }}
    </h2>
    <!-- Schedule Type Selection -->
    <div class="mb-6 max-md:mb-4">
      <label
        class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
        >{{ $t("schedule_type") }}</label
      >
      <CustomSelect v-model="scheduleData.type">
        <option value="weekly">{{ $t("weekly") }}</option>
        <option value="monthly">{{ $t("monthly") }}</option>
      </CustomSelect>
    </div>
    <!-- Weekly Settings -->
    <div v-if="scheduleData.type === 'weekly'" class="mb-6 max-md:mb-4">
      <label
        class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
        >{{ $t("select_day_of_week") }}</label
      >
      <CustomSelect v-model="scheduleData.weekDay">
        <option value="1">{{ $t("monday") }}</option>
        <option value="2">{{ $t("tuesday") }}</option>
        <option value="3">{{ $t("wednesday") }}</option>
        <option value="4">{{ $t("thursday") }}</option>
        <option value="5">{{ $t("friday") }}</option>
        <option value="6">{{ $t("saturday") }}</option>
        <option value="0">{{ $t("sunday") }}</option>
      </CustomSelect>
    </div>
    <!-- Monthly Settings -->
    <div v-if="scheduleData.type === 'monthly'" class="mb-6 max-md:mb-4">
      <label
        class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
        >{{ $t("select_day_of_month") }}</label
      >
      <CustomSelect v-model="scheduleData.monthDay">
        <option v-for="day in 31" :key="day" :value="String(day)">
          {{ day }}{{ getDayPrefix(day) }}
        </option>
      </CustomSelect>
    </div>
    <!-- Time Settings -->
    <div
      class="grid grid-cols-2 gap-6 mb-4 max-md:grid-cols-1 max-md:gap-4 max-md:mb-3"
    >
      <div>
        <label
          class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
          >{{ $t("hour") }}</label
        >
        <CustomSelect v-model="scheduleData.hour">
          <option
            v-for="h in 24"
            :key="h - 1"
            :value="(h - 1).toString().padStart(2, '0')"
          >
            {{ (h - 1).toString().padStart(2, "0") }}:00
          </option>
        </CustomSelect>
      </div>
      <div>
        <label
          class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
          >{{ $t("minute") }}</label
        >
        <CustomSelect v-model="scheduleData.minute">
          <option
            v-for="m in 60"
            :key="m - 1"
            :value="(m - 1).toString().padStart(2, '0')"
          >
            {{ (m - 1).toString().padStart(2, "0") }}
          </option>
        </CustomSelect>
      </div>
    </div>
    <!-- Active Toggle -->
    <div class="flex items-center gap-2">
      <BaseToggleSwitch v-model="scheduleData.isActive" />
      <span class="text-sm text-gray-600 max-md:text-xs">
        {{
          scheduleData.isActive
            ? $t("schedule_active")
            : $t("schedule_inactive")
        }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const scheduleData = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const getDayPrefix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const getScheduleDescription = computed(() => {
  const timeStr = `${scheduleData.value.hour}:${scheduleData.value.minute}`;
  if (scheduleData.value.type === "weekly") {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `Every ${days[scheduleData.value.weekDay]} at ${timeStr}`;
  } else {
    const day = scheduleData.value.monthDay;
    return `Every ${day}${getDayPrefix(day)} of month at ${timeStr}`;
  }
});
</script>
