<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("fingerprint_list") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div class="flex items-center gap-4 max-md:w-full">
          <LoadingButton
            :loading="isRefreshButtonLoading"
            @click="handleRefresh"
            class="bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            <div class="flex items-center gap-2">
              <Icon icon="mdi:refresh" class="max-md:w-4 max-md:h-4" />
              {{ $t("refresh") }}
            </div>
          </LoadingButton>
        </div>
        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_fingerprints')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="header.sortable && handleSort(header.key)"
              >
                <div class="flex items-center justify-center gap-1">
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
              v-for="fingerprint in paginatedFingerprints"
              :key="fingerprint._id"
              class="lg:hover:bg-gray-50 whitespace-nowrap"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ fingerprint.no }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center flex-col gap-1">
                  <div class="flex items-center justify-center gap-1">
                    {{ fingerprint.username }}
                  </div>
                  <button
                    @click="openFingerprintDetails(fingerprint)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 flex items-center justify-center gap-1 max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    <Icon
                      icon="material-symbols:visibility"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    <span>{{ $t("view") }}</span>
                  </button>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm font-mono max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ fingerprint.visitorId }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ fingerprint.browserName || "-" }}
                <span v-if="fingerprint.browserVersion" class="text-gray-500">
                  v{{ fingerprint.browserVersion }}
                </span>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ fingerprint.os || "-" }}
                <span v-if="fingerprint.osVersion" class="text-gray-500">
                  {{ fingerprint.osVersion }}
                </span>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ fingerprint.device || "-" }}
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ fingerprint.ip || "-" }}
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs max-md:px-1.5 max-md:py-2 max-md:text-[10px]',
                      fingerprint.incognito
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800',
                    ]"
                  >
                    {{ fingerprint.incognito ? $t("yes") : $t("no") }}
                  </span>
                </div>
              </td>

              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs max-md:px-1.5 max-md:py-2 max-md:text-[10px]',
                      fingerprint.isDuplicateAttempt
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800',
                    ]"
                  >
                    {{
                      fingerprint.isDuplicateAttempt
                        ? $t("duplicate")
                        : $t("new")
                    }}
                  </span>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="fingerprint.confidence?.score" class="font-medium">
                  {{ (fingerprint.confidence.score * 100).toFixed(1) }}%
                </span>
                <span v-else>-</span>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{
                  fingerprint.createdAt
                    ? formatDate(fingerprint.createdAt)
                    : "-"
                }}
              </td>
            </tr>

            <tr
              v-if="paginatedFingerprints.length === 0"
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
                  {{ $t("no_fingerprints_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedFingerprints.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />

      <FingerprintDetailsModal
        v-if="showFingerprintDetails && selectedFingerprint"
        v-model:show="showFingerprintDetails"
        :fingerprint-data="selectedFingerprint"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const { publicGet } = useApiEndpoint();
const isPageLoading = ref(true);
const isRefreshButtonLoading = ref(false);
const allFingerprints = ref([]);

const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  { key: "visitorId", label: "Visitor ID", labelCN: "访客ID", sortable: false },
  { key: "browser", label: "Browser", labelCN: "浏览器", sortable: true },
  { key: "os", label: "OS", labelCN: "操作系统", sortable: true },
  { key: "device", label: "Device", labelCN: "设备", sortable: false },
  { key: "ip", label: "IP Address", labelCN: "IP地址", sortable: false },
  { key: "incognito", label: "Incognito", labelCN: "隐身模式", sortable: true },
  {
    key: "isDuplicateAttempt",
    label: "Status",
    labelCN: "状态",
    sortable: true,
  },
  { key: "confidence", label: "Confidence", labelCN: "置信度", sortable: true },
  {
    key: "createdAt",
    label: "Created At",
    labelCN: "创建时间",
    sortable: true,
  },
];

const sortConfig = ref({
  key: "createdAt",
  direction: "desc",
});

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1;
  fetchAllFingerprints();
}, 300);

const handleSort = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
  fetchAllFingerprints();
};

const searchQuery = ref("");
const handleTypeChange = (type) => {};
const showFingerprintDetails = ref(false);
const selectedFingerprint = ref(null);

const currentPage = ref(1);
const itemsPerPage = ref(20);
const totalItems = ref(0);

const fetchAllFingerprints = async () => {
  isPageLoading.value = true;
  try {
    const queryParams = new URLSearchParams({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      sortBy: sortConfig.value.key,
      sortOrder: sortConfig.value.direction,
    });

    const { data } = await publicGet(`fingerprints?${queryParams}`);
    if (data.success) {
      allFingerprints.value = data.data.fingerprints;
      totalItems.value = data.data.pagination.totalFingerprints;
    }
  } catch (error) {
    console.error("Error fetching fingerprints:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_fingerprints"),
    });
  } finally {
    isPageLoading.value = false;
  }
};

const openFingerprintDetails = async (fingerprint) => {
  try {
    const { data } = await publicGet(`fingerprints/${fingerprint._id}`);
    if (data.success) {
      selectedFingerprint.value = data.data;
      showFingerprintDetails.value = true;
    }
  } catch (error) {
    console.error("Error fetching fingerprint details:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch fingerprint details",
    });
  }
};

const handleRefresh = async () => {
  isRefreshButtonLoading.value = true;
  await fetchAllFingerprints();
  isRefreshButtonLoading.value = false;
  Swal.fire({
    icon: "success",
    title: $t("refresh_successful"),
    text: $t("data_refreshed"),
    timer: 1500,
  });
};

watch(currentPage, () => {
  fetchAllFingerprints();
});

watch(searchQuery, () => {
  debouncedSearch();
});

const paginatedFingerprints = computed(() => {
  return allFingerprints.value.map((fingerprint, index) => ({
    ...fingerprint,
    no: (currentPage.value - 1) * itemsPerPage.value + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value)
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

const route = useRoute();
if (route.query.search) {
  searchQuery.value = route.query.search;
}

onMounted(async () => {
  if (route.query.search) {
    searchQuery.value = route.query.search;
  }
  await fetchAllFingerprints();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Fingerprint List",
});
</script>
