<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("admin_logs") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >{{ $t("date") }}:</label
          >
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
            <span class="text-gray-500 max-md:text-sm max-md:hidden">-</span>
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

      <div class="flex justify-end gap-3">
        <BaseResetButton @click="resetFilters" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div class="flex items-center gap-4 max-md:gap-3 max-md:hidden">
          <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
          <span class="text-xl font-semibold">{{ $t("log_details") }}</span>
        </div>
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch v-model="searchQuery" @type-change="handleTypeChange" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1"
                >
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <div v-if="header.sortable">
                    <Icon
                      :icon="
                        sortConfig.key === header.key
                          ? sortConfig.direction === 'asc'
                            ? 'material-symbols:arrow-upward'
                            : 'material-symbols:arrow-downward'
                          : 'material-symbols:unfold-more'
                      "
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-center">
            <tr
              v-for="log in paginatedLogs"
              :key="log._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.username }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.fullname }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.ip }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(log.createdAt) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ log.remark || "-" }}
              </td>
            </tr>
            <tr
              v-if="paginatedLogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="tableHeaders.length"
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
import moment from "moment-timezone";
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const isPageLoading = ref(true);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "username", label: "Username", labelCN: "用户名", sortable: false },
  { key: "fullname", label: "Full Name", labelCN: "全名", sortable: false },
  { key: "ip", label: "IP Address", labelCN: "IP地址", sortable: true },
  {
    key: "loginTime",
    label: "Login Time",
    labelCN: "登录时间",
    sortable: true,
  },
  { key: "remark", label: "Remark", labelCN: "备注", sortable: false },
];

const logs = ref([]);
const { get } = useApiEndpoint();

const sortConfig = ref({
  key: "no",
  direction: "asc",
});

const handleSort = (key) => {
  if (!tableHeaders.find((h) => h.key === key).sortable) return;

  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);
const searchQuery = ref("");

const fetchLogs = async () => {
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    isPageLoading.value = true;
    const { data } = await get(`adminuserlogs?${params.toString()}`);
    if (data.success) {
      logs.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching admin logs:", error);
  } finally {
    isPageLoading.value = false;
  }
};

const filteredLogs = computed(() => {
  let filtered = [...logs.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        (item.username?.toLowerCase() || "").includes(searchTerm) ||
        (item.fullname?.toLowerCase() || "").includes(searchTerm) ||
        (item.ip?.toLowerCase() || "").includes(searchTerm)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (
        sortConfig.value.key === "loginTime" ||
        sortConfig.value.key === "createdAt"
      ) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }
  return filtered;
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredLogs.value.slice(start, end).map((log, index) => ({
    ...log,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredLogs.value.length / itemsPerPage.value)
);

const resetFilters = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

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

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

useHead({
  title: "Play System | Admin Log",
});
</script>
