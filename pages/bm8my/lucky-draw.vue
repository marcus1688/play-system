<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("lucky_draw") }}
          </h1>
        </div>
      </div>
      <div
        class="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow max-md:px-3 max-md:py-1.5 max-md:w-full max-md:justify-between"
      >
        <BaseToggleSwitch
          v-model="isLuckyDrawActive"
          @update:modelValue="toggleLuckyDrawStatus"
        />
        <span
          :class="[
            'text-sm font-semibold max-md:text-xs',
            isLuckyDrawActive ? 'text-green-600' : 'text-red-600',
          ]"
        >
          {{ isLuckyDrawActive ? $t("active") : $t("inactive") }}
        </span>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
          >
            {{ $t("date") }}:
          </label>
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
            />
          </div>
        </div>
        <DateFilterButtons ref="dateFilterRef" v-model="dateRange" />
      </div>

      <div class="flex items-center justify-end max-md:justify-stretch">
        <button
          @click="resetFilters"
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 flex items-center gap-2 justify-center max-md:px-4 max-md:py-2 max-md:text-sm max-md:w-full"
        >
          <Icon icon="material-symbols:refresh" class="max-md:w-4 max-md:h-4" />
          {{ $t("reset") }}
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch v-model="searchQuery" @type-change="handleTypeChange" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("username") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("fullname") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("prize_name") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("prize_value") }} ({{ currency }})
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("grid_position") }}
              </th>

              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("ip_address") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("draw_time") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(log, index) in filteredLogs"
              :key="log._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>

              <td
                class="px-6 py-4 text-sm font-medium text-blue-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.username }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.fullname }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium max-md:px-2 max-md:py-2 max-md:text-xs',
                    getPrizeColor(log.prizeValue),
                  ]"
                >
                  {{ log.prizeName }}
                </span>
              </td>

              <td
                class="px-6 py-4 text-sm font-semibold text-green-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(log.prizeValue) }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <span
                    class="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-medium max-md:w-6 max-md:h-6"
                  >
                    {{ log.gridPosition }}
                  </span>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 font-mono max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.ipAddress }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex flex-col">
                  <span>{{ formatDate(log.createdAt) }}</span>
                </div>
              </td>
            </tr>

            <tr
              v-if="filteredLogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="9"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_logs_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="filteredLogs.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";

const { get, patch } = useApiEndpoint();
const isLuckyDrawActive = ref(true);
const currency = useCurrency();
const isPageLoading = ref(true);
const isFetchLoading = ref(false);
const dateFilterRef = ref(null);
const logs = ref([]);
const searchQuery = ref("");
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value)
);

const filteredLogs = computed(() => {
  let filtered = [...logs.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.username.toLowerCase().includes(searchTerm) ||
        log.fullname.toLowerCase().includes(searchTerm) ||
        log.prizeName.toLowerCase().includes(searchTerm) ||
        log.ipAddress.includes(searchQuery.value)
    );
  }
  return filtered;
});

const resetFilters = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
};

const fetchLogs = async () => {
  isFetchLoading.value = true;
  try {
    const queryParams = new URLSearchParams({
      page: currentPage.value,
      limit: itemsPerPage.value,
    });
    if (dateRange.value.startDate && dateRange.value.endDate) {
      queryParams.append("startDate", dateRange.value.startDate);
      queryParams.append("endDate", dateRange.value.endDate);
    }
    const { data } = await get(`luckydraw9grid/logs?${queryParams}`);
    if (data.success) {
      logs.value = data.data.logs;
      totalItems.value = data.data.pagination.totalCount;
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error fetching lucky draw logs:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isFetchLoading.value = false;
  }
};

const handleTypeChange = (type) => {
  searchType.value = type;
};

const getPrizeColor = (prizeValue) => {
  if (prizeValue >= 1000) return "bg-red-100 text-red-800";
  if (prizeValue >= 100) return "bg-orange-100 text-orange-800";
  if (prizeValue >= 10) return "bg-blue-100 text-blue-800";
  return "bg-green-100 text-green-800";
};

const fetchLuckyDrawStatus = async () => {
  try {
    const { data } = await get("luckydraw9grid/status");
    if (data.success) {
      isLuckyDrawActive.value = data.data.isActive;
    }
  } catch (error) {
    console.error("Error fetching lucky draw status:", error);
  }
};

const toggleLuckyDrawStatus = async (newStatus) => {
  try {
    const result = await Swal.fire({
      icon: "question",
      title: $t("confirm_action"),
      text: newStatus
        ? $t("confirm_activate_lucky_draw")
        : $t("confirm_deactivate_lucky_draw"),
      showCancelButton: true,
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) {
      isLuckyDrawActive.value = !newStatus;
      return;
    }

    const { data } = await patch("luckydraw9grid/status", {
      isActive: newStatus,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
        showConfirmButton: false,
      });
      isLuckyDrawActive.value = newStatus;
    } else {
      isLuckyDrawActive.value = !newStatus;
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    isLuckyDrawActive.value = !newStatus;
    console.error("Error toggling lucky draw status:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

watch(currentPage, () => {
  fetchLogs();
});

watch(searchQuery, () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  }
});

watch(
  dateRange,
  () => {
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchLogs();
    }
  },
  { deep: true }
);

onMounted(async () => {
  await Promise.all([fetchLogs(), fetchLuckyDrawStatus()]);
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Lucky Draw Management",
});
</script>

<style scoped></style>
