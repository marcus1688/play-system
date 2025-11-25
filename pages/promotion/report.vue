<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("promotion_report") }}
          </h1>
        </div>
      </div>
    </div>

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
      <div
        class="flex items-center justify-between max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <button
          v-if="
            adminUserData?.role === 'superadmin' ||
            adminUserData?.role === 'admin'
          "
          @click="handleExport"
          :disabled="isExporting || filteredPromotions.length === 0"
          class="px-6 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon
            :icon="
              isExporting ? 'eos-icons:loading' : 'material-symbols:download'
            "
            class="max-md:w-4 max-md:h-4"
          />
          {{ $t("export_to_excel") }}
        </button>
        <div v-else></div>
        <BaseResetButton @click="handleReset" />
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Promotion Name"
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
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div
                  class="flex items-center gap-1 justify-center whitespace-nowrap"
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
          <tbody class="divide-y divide-gray-200 text-center whitespace-nowrap">
            <tr
              v-for="promo in paginatedPromotions"
              :key="promo.id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.nameEN }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.category || "N/A" }}
              </td>

              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.claimtype }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.appClaimCount }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(promo.appBonusAmount) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.rejClaimCount }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(promo.rejBonusAmount) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promo.revClaimCount }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }}
                {{ formatAmount(promo.revBonusAmount) }}
              </td>
            </tr>
            <tr
              v-if="paginatedPromotions.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="11"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_promotions_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedPromotions.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";
import moment from "moment-timezone";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const { get } = useApiEndpoint();
const currency = useCurrency();

const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号", sortable: false },
  {
    key: "promoName",
    label: "Promo. Name",
    labelCN: "优惠名称",
    sortable: false,
  },
  { key: "category", label: "Category", labelCN: "分类", sortable: false },
  {
    key: "claimType",
    label: "Claim Type",
    labelCN: "领取类型",
    sortable: false,
  },
  {
    key: "appClaimCount",
    label: "App. Claim Count",
    labelCN: "批准领取次数",
    sortable: true,
  },
  {
    key: "appBonusAmount",
    label: "App. Bonus Amount",
    labelCN: "批准奖金金额",
    sortable: true,
  },
  {
    key: "rejClaimCount",
    label: "Rej. Claim Count",
    labelCN: "拒绝领取次数",
    sortable: true,
  },
  {
    key: "rejBonusAmount",
    label: "Rej. Bonus Amount",
    labelCN: "拒绝奖金金额",
    sortable: true,
  },
  {
    key: "revClaimCount",
    label: "Rev. Claim Count",
    labelCN: "撤销领取次数",
    sortable: true,
  },
  {
    key: "revBonusAmount",
    label: "Rev. Bonus Amount",
    labelCN: "撤销奖金金额",
    sortable: true,
  },
];

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

const promotions = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const fetchReportData = async () => {
  try {
    const params = new URLSearchParams();
    if (dateRange.value.startDate)
      params.append("startDate", dateRange.value.startDate);
    if (dateRange.value.endDate)
      params.append("endDate", dateRange.value.endDate);

    const { data } = await get(`promotions-report?${params.toString()}`);
    if (data.success) {
      promotions.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching promotions report:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load promotions report",
    });
  }
};

const filteredPromotions = computed(() => {
  let filtered = [...promotions.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((promo) =>
      promo.name.toLowerCase().includes(searchTerm)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (typeof aVal === "string" && !isNaN(aVal)) aVal = parseFloat(aVal);
      if (typeof bVal === "string" && !isNaN(bVal)) bVal = parseFloat(bVal);
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }
  return filtered;
});

const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPromotions.value.slice(start, end).map((promo, index) => ({
    ...promo,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredPromotions.value.length / itemsPerPage.value)
);

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchReportData();
};

const handleExport = async () => {
  try {
    const hasExportPermission =
      adminUserData.value?.role === "superadmin" ||
      adminUserData.value?.role === "admin";
    if (!hasExportPermission) {
      Swal.fire({
        icon: "error",
        title: $t("permission_denied"),
        text: $t("export_permission_required"),
      });
      return;
    }
    if (filteredPromotions.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredPromotions.value.map((promo, index) => ({
      no: index + 1,
      nameEN: promo.nameEN,
      category: promo.category,
      claimtype: promo.claimtype,
      appClaimCount: promo.appClaimCount,
      appBonusAmount: promo.appBonusAmount,
      rejClaimCount: promo.rejClaimCount,
      rejBonusAmount: promo.rejBonusAmount,
      revClaimCount: promo.revClaimCount,
      revBonusAmount: promo.revBonusAmount,
    }));
    let filename = "promotion_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    } else {
      filename += `_${moment().format("YYYY-MM-DD")}`;
    }
    await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("promotion_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        nameEN: { header: $t("promo_name"), width: 20 },
        category: { header: $t("category"), width: 15 },
        claimtype: { header: $t("claim_type"), width: 15 },
        appClaimCount: { header: $t("app_claim_count"), width: 15 },
        appBonusAmount: { header: $t("app_bonus_amount"), width: 15 },
        rejClaimCount: { header: $t("rej_claim_count"), width: 15 },
        rejBonusAmount: { header: $t("rej_bonus_amount"), width: 15 },
        revClaimCount: { header: $t("rev_claim_count"), width: 15 },
        revBonusAmount: { header: $t("rev_bonus_amount"), width: 15 },
      },
      formatter: (value, key) => {
        const moneyFields = [
          "appBonusAmount",
          "rejBonusAmount",
          "revBonusAmount",
        ];

        if (moneyFields.includes(key) && typeof value === "number") {
          return value.toFixed(2);
        }

        return value;
      },
      beforeExport: () => {},
      afterExport: (success) => {
        if (success) {
          Swal.fire({
            icon: "success",
            title: $t("export_success"),
            text: $t("file_downloaded_successfully"),
            timer: 1500,
          });
        }
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    Swal.fire({
      icon: "error",
      title: $t("export_failed"),
      text: error.message,
    });
  }
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
      fetchReportData();
    }
  }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchReportData();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Promotion Report",
});
</script>
