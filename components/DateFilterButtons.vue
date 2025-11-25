<template>
  <div class="flex flex-wrap gap-2 max-md:gap-1.5">
    <button
      v-for="filter in filters"
      :key="filter.key"
      @click="handleFilter(filter.key)"
      :class="[
        'px-4 py-2 rounded-lg max-md:px-3 max-md:py-1.5',
        filter.key === activeFilter
          ? 'bg-indigo-600 text-white lg:hover:bg-indigo-500'
          : 'bg-gray-100 text-gray-600 lg:hover:bg-gray-200',
      ]"
    >
      <p class="text-sm whitespace-nowrap max-md:text-xs">
        {{ $i18n.locale === "zh" ? filter.labelCN : filter.label }}
      </p>
    </button>
  </div>
</template>

<script setup>
import moment from "moment-timezone";

moment.updateLocale("en", {
  week: {
    dow: 1,
  },
});

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ startDate: null, endDate: null }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const activeFilter = ref("today");

const filters = [
  { key: "today", label: "Today", labelCN: "今天" },
  { key: "yesterday", label: "Yesterday", labelCN: "昨天" },
  { key: "thisWeek", label: "This Week", labelCN: "本周" },
  { key: "lastWeek", label: "Last Week", labelCN: "上周" },
  { key: "thisMonth", label: "This Month", labelCN: "本月" },
  { key: "lastMonth", label: "Last Month", labelCN: "上月" },
];

const handleFilter = (filterKey) => {
  const now = moment().tz("Asia/Kuala_Lumpur");
  let startDate, endDate;

  activeFilter.value = filterKey;

  switch (filterKey) {
    case "today":
      startDate = now.clone().startOf("day");
      endDate = now.clone().endOf("day");
      break;
    case "yesterday":
      startDate = now.clone().subtract(1, "days").startOf("day");
      endDate = now.clone().subtract(1, "days").endOf("day");
      break;
    case "thisWeek":
      startDate = now.clone().startOf("week");
      endDate = now.clone().endOf("week");
      break;
    case "lastWeek":
      startDate = now.clone().subtract(1, "weeks").startOf("week");
      endDate = now.clone().subtract(1, "weeks").endOf("week");
      break;
    case "thisMonth":
      startDate = now.clone().startOf("month");
      endDate = now.clone().endOf("month");
      break;
    case "lastMonth":
      startDate = now.clone().subtract(1, "months").startOf("month");
      endDate = now.clone().subtract(1, "months").endOf("month");
      break;
  }

  emit("update:modelValue", {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
  });
};

const handleReset = () => {
  activeFilter.value = "today";
  handleFilter("today");
};

defineExpose({ handleReset });

const checkActiveFilter = () => {
  if (!props.modelValue.startDate || !props.modelValue.endDate) {
    activeFilter.value = null;
    return;
  }
  const now = moment().tz("Asia/Kuala_Lumpur");
  const startDate = moment(props.modelValue.startDate).tz("Asia/Kuala_Lumpur");
  const endDate = moment(props.modelValue.endDate).tz("Asia/Kuala_Lumpur");
  if (
    startDate.isSame(now.clone().startOf("day")) &&
    endDate.isSame(now.clone().endOf("day"))
  ) {
    activeFilter.value = "today";
  } else if (
    startDate.isSame(now.clone().subtract(1, "days").startOf("day")) &&
    endDate.isSame(now.clone().subtract(1, "days").endOf("day"))
  ) {
    activeFilter.value = "yesterday";
  } else if (
    startDate.isSame(now.clone().startOf("week")) &&
    endDate.isSame(now.clone().endOf("week"))
  ) {
    activeFilter.value = "thisWeek";
  } else if (
    startDate.isSame(now.clone().subtract(1, "weeks").startOf("week")) &&
    endDate.isSame(now.clone().subtract(1, "weeks").endOf("week"))
  ) {
    activeFilter.value = "lastWeek";
  } else if (
    startDate.isSame(now.clone().startOf("month")) &&
    endDate.isSame(now.clone().endOf("month"))
  ) {
    activeFilter.value = "thisMonth";
  } else if (
    startDate.isSame(now.clone().subtract(1, "months").startOf("month")) &&
    endDate.isSame(now.clone().subtract(1, "months").endOf("month"))
  ) {
    activeFilter.value = "lastMonth";
  } else {
    activeFilter.value = null;
  }
};

watch(
  () => props.modelValue,
  () => {
    checkActiveFilter();
  },
  { deep: true }
);

onMounted(() => {
  handleFilter("today");
});
</script>
