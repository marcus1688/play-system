<template>
  <div
    class="bg-white rounded-lg shadow min-w-[500px] min-h-[400px] overflow-x-auto max-md:min-w-0 max-md:min-h-[300px]"
  >
    <PageLoading v-if="isPageLoading" />
    <div class="p-4 border-b max-md:p-3">
      <div class="flex items-center gap-4 max-md:gap-2">
        <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
        <h3 class="text-lg font-semibold max-md:text-base">
          {{ $t("bonus_history") }}
        </h3>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="p-4 max-md:p-3">
      <div class="flex justify-between gap-4 max-xl:flex-col max-md:gap-3">
        <div
          class="flex items-center gap-2 max-md:flex-col max-md:items-stretch"
        >
          <BaseDatePicker
            v-model="dateRange.startDate"
            :placeholder="$t('start_date')"
            :is-start-date="true"
            :other-date="dateRange.endDate"
            @update:otherDate="dateRange.endDate = null"
          />
          <span class="text-gray-500 max-md:hidden">-</span>
          <BaseDatePicker
            v-model="dateRange.endDate"
            :placeholder="$t('end_date')"
            :is-start-date="false"
            :other-date="dateRange.startDate"
            @update:otherDate="dateRange.endDate = null"
          />
        </div>
        <DateFilterButtons ref="dateFilterRef" v-model="dateRange" />
      </div>
    </div>

    <div>
      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("promotion") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("amount") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("status") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("process_by") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("time") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="log in paginatedLogs"
              :key="log.id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.username }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.promotionnameEN }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.amount }}
              </td>
              <td
                class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <span :class="getStatusClass(log.status)">
                  {{ log.status }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <span class="block">{{ log.processBy }}</span>
                <span class="block text-xs max-md:text-[10px]"
                  >( {{ log.processtime }} )</span
                >
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ log.time }}
              </td>
            </tr>
            <tr
              v-if="paginatedLogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="7"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:py-3"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  <span class="max-md:text-xs">{{
                    $t("no_bonus_logs_found")
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedLogs.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";
import moment from "moment-timezone";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
});

const { get } = useApiEndpoint();
const isPageLoading = ref(true);
const bonuses = ref([]);

const fetchBonuses = async () => {
  try {
    isPageLoading.value = true;
    const params = new URLSearchParams();
    if (dateRange.value.startDate) {
      params.append("startDate", dateRange.value.startDate);
    }
    if (dateRange.value.endDate) {
      params.append("endDate", dateRange.value.endDate);
    }
    const response = await get(
      `user/${props.userId}/bonuses?${params.toString()}`
    );
    if (response.data.success) {
      bonuses.value = response.data.data.map((bonus, index) => ({
        ...bonus,
        no: index + 1,
        time: formatDate(bonus.createdAt),
        amount: formatAmount(bonus.amount),
      }));
    }
  } catch (error) {
    console.error("Error fetching bonus history:", error);
  } finally {
    isPageLoading.value = false;
  }
};

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const currentPage = ref(1);
const perPage = ref(10);

const filteredLogs = computed(() => {
  let filtered = [...bonuses.value];
  if (dateRange.value.startDate && dateRange.value.endDate) {
    filtered = filtered.filter((item) => {
      const itemDate = moment(item.createdAt).tz("Asia/Kuala_Lumpur");
      const startDate = moment(dateRange.value.startDate)
        .tz("Asia/Kuala_Lumpur")
        .startOf("day");
      const endDate = moment(dateRange.value.endDate)
        .tz("Asia/Kuala_Lumpur")
        .endOf("day");
      return itemDate.isBetween(startDate, endDate, null, "[]");
    });
  }
  return filtered;
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredLogs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / perPage.value);
});

const getStatusClass = (status) => {
  const classes = {
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return `${
    classes[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  } px-2 py-1 rounded`;
};

watch(
  [() => dateRange.value.startDate, () => dateRange.value.endDate],
  ([newStartDate, newEndDate], [oldStartDate, oldEndDate]) => {
    if (
      newStartDate &&
      newEndDate &&
      (newStartDate !== oldStartDate || newEndDate !== oldEndDate)
    ) {
      currentPage.value = 1;
      fetchBonuses();
    }
  }
);

onMounted(async () => {
  await fetchBonuses();
  isPageLoading.value = false;
});
</script>
