<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("transaction_log") }}
        </h1>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <!-- Date Range -->
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
        class="grid grid-cols-2 gap-6 mb-6 max-lg:grid-cols-2 max-sm:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
            >{{ $t("transaction_type") }}:</label
          >
          <CustomSelect v-model="filters.transactionType">
            <option value="">{{ $t("select_transaction_types") }}</option>
            <option value="deposit">{{ $t("deposit") }}</option>
            <option value="withdraw">{{ $t("withdraw") }}</option>
            <option value="bonus">{{ $t("bonus") }}</option>
          </CustomSelect>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
            >{{ $t("status") }}:</label
          >
          <CustomSelect v-model="filters.status">
            <option value="">{{ $t("all") }}</option>
            <option value="approved">{{ $t("approved") }}</option>
            <option value="rejected">{{ $t("rejected") }}</option>
            <option value="reverted">{{ $t("reverted") }}</option>
          </CustomSelect>
        </div>

        <div class="hidden">
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
            >{{ $t("reverted") }}:</label
          >
          <CustomSelect v-model="filters.reverted">
            <option value="">{{ $t("all") }}</option>
            <option value="yes">{{ $t("yes") }}</option>
            <option value="no">{{ $t("no2") }}</option>
          </CustomSelect>
        </div>
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
          :disabled="isExporting || filteredTransactions.length === 0"
          class="px-6 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-4 max-md:py-2 max-md:text-sm"
        >
          <Icon
            :icon="
              isExporting ? 'eos-icons:loading' : 'material-symbols:download'
            "
          />
          {{ $t("export_to_excel") }}
        </button>
        <div v-else></div>
        <button
          @click="resetFilters"
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 flex items-center gap-2 justify-center max-md:px-4 max-md:py-2 max-md:text-sm"
        >
          <Icon icon="material-symbols:refresh" />
          {{ $t("reset") }}
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-start"
      >
        <div class="flex items-center gap-4 max-md:gap-3 max-md:hidden">
          <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
          <span class="text-xl font-semibold">{{
            $t("transaction_details")
          }}</span>
        </div>

        <div class="flex items-center gap-2 max-md:w-full">
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
                <div class="flex items-center justify-center gap-2">
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
              v-for="item in paginatedTransactions"
              :key="item._id"
              class="font-semibold whitespace-nowrap"
              :class="getRowStyle(item.transactionType)"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ item.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="flex items-center justify-center gap-1">
                  <Icon
                    v-if="item.duplicateIP"
                    icon="material-symbols:warning-rounded"
                    class="text-amber-500 max-md:w-3 max-md:h-3"
                  />
                  <Icon
                    v-if="item.duplicateBank"
                    icon="material-symbols:error"
                    class="text-red-500 max-md:w-3 max-md:h-3"
                  />
                  {{ item.fullname }}
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div v-if="item.transactionType === 'bonus'">
                  <div>{{ item.promotionnameEN }}</div>
                </div>
                <div v-else-if="item.transactionType === 'user cashout'">
                  <div>N/A</div>
                </div>
                <div v-else>
                  <div>{{ $t("bank_name") }}: {{ item.bankname }}</div>
                  <div v-if="item.bankcode">
                    {{ $t("bank_code") }}: {{ item.bankcode }}
                  </div>
                  <div>
                    <span v-if="item.bankname === 'USDT'">{{
                      $t("address")
                    }}</span>
                    <span v-else>{{ $t("owner_name") }}</span>
                    : {{ item.ownername }}
                  </div>
                  <div v-if="item.bankname !== 'USDT'">
                    {{ $t("transfer_number") }}: {{ item.transfernumber }}
                  </div>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ item.transactionType }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ item.amount.toFixed(2) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span :class="getStatusStyle(item.status)">{{
                  item.status
                }}</span>
              </td>
              <td
                class="px-6 py-4 text-sm break-words max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div class="text-wrap">{{ item.game || "-" }}</div>
              </td>
              <td
                class="px-6 py-4 text-sm break-words max-md:px-3 max-md:py-3 max-md:text-xs"
                style="width: 200px; min-width: 200px; max-width: 200px"
              >
                <div class="text-wrap">{{ item.remark || "-" }}</div>
                <div v-if="item.depositname" class="mt-1 text-wrap">
                  {{ $t("deposit_name") }}: {{ item.depositname }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  v-if="item.transactionType === 'deposit' && item.imageUrl"
                  @click="openReceiptModal(item.imageUrl)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1 max-md:text-xs"
                >
                  {{ $t("view") }}
                </button>
                <button
                  v-else-if="
                    item.transactionType === 'bonus' &&
                    (item.imageUrl ||
                      (item.imageUrls && item.imageUrls.length > 0))
                  "
                  @click="openBonusReceiptModal(item)"
                  class="px-4 py-2 bg-blue-500 text-white rounded lg:hover:bg-blue-600 max-md:px-3 max-md:py-1 max-md:text-xs"
                >
                  {{ $t("view") }}
                </button>
                <button
                  v-else
                  disabled
                  class="px-4 py-2 bg-gray-400 text-white rounded !cursor-not-allowed max-md:px-3 max-md:py-1 max-md:text-xs"
                >
                  N/A
                </button>
              </td>
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <LoadingButton
                  v-if="
                    item.status === 'approved' &&
                    !item.reverted &&
                    item.transactionType !== 'user cashout' &&
                    item.bankname !== 'USDT'
                  "
                  :loading="isButtonLoading[item._id]"
                  @click="revertTransaction(item._id, item.transactionType)"
                  class="px-4 py-2 bg-red-600 text-white rounded lg:hover:bg-red-500 max-md:px-3 max-md:py-1 max-md:text-xs"
                >
                  {{ $t("revert") }}
                </LoadingButton>
                <span
                  v-else-if="item.reverted"
                  class="px-4 py-2 bg-gray-400 text-white rounded !cursor-not-allowed max-md:px-3 max-md:py-1 max-md:text-xs"
                >
                  {{ $t("reverted_status") }}
                </span>
                <span
                  v-else
                  class="px-4 py-2 bg-gray-400 text-white rounded !cursor-not-allowed max-md:px-3 max-md:py-1 max-md:text-xs"
                >
                  N/A
                </span>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(item.createdAt) }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div>{{ item.processBy }}</div>
              </td>
            </tr>
            <tr
              v-if="paginatedTransactions.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="11"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_transaction") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedTransactions.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />
    </div>

    <!-- Receipt Modal -->
    <ReceiptModal
      v-model:show="showReceiptModal"
      :image-url="selectedReceiptUrl"
      :image-urls="selectedReceiptUrls"
    />
  </div>
</template>

<script setup>
import moment from "moment-timezone";
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const selectedReceiptUrls = ref([]);
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const currency = useCurrency();
const dateFilterRef = ref(null);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号", sortable: false },
  {
    key: "playerDetails",
    label: "Player Details",
    labelCN: "玩家详情",
    sortable: false,
  },
  {
    key: "bankDetails",
    label: "Bank Details",
    labelCN: "银行详情",
    sortable: false,
  },
  {
    key: "transactionType",
    label: "Transaction Type",
    labelCN: "交易类型",
    sortable: false,
  },
  { key: "amount", label: "Amount", labelCN: "金额", sortable: true },
  { key: "status", label: "Status", labelCN: "状态", sortable: true },
  { key: "game", label: "Game", labelCN: "游戏", sortable: false },
  { key: "remark", label: "Remark", labelCN: "备注", sortable: false },
  { key: "receipt", label: "Receipt", labelCN: "收据", sortable: false },
  { key: "action", label: "Action", labelCN: "操作", sortable: false },
  {
    key: "dateTime",
    label: "Date & Time",
    labelCN: "日期和时间",
    sortable: true,
  },
  { key: "processBy", label: "Process By", labelCN: "处理人", sortable: false },
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

const showReceiptModal = ref(false);
const selectedReceiptUrl = ref("");
const { get } = useApiEndpoint();
const transactions = ref([]);

const fetchTransactions = async () => {
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    const { data } = await get(`transactionlog?${params.toString()}`);

    if (data.success) {
      transactions.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
};

const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const filters = ref({
  transactionType: "",
  reverted: "",
  status: "",
});
const searchQuery = ref("");

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.username.toLowerCase().includes(searchTerm) ||
        item.fullname.toLowerCase().includes(searchTerm) ||
        (item.promotionnameEN &&
          item.promotionnameEN.toLowerCase().includes(searchTerm)) ||
        (item.processBy && item.processBy.toLowerCase().includes(searchTerm)) ||
        (item.remark && item.remark.toLowerCase().includes(searchTerm))
    );
  }

  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (sortConfig.value.key === "dateTime") {
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

  if (filters.value.transactionType) {
    filtered = filtered.filter(
      (item) => item.transactionType === filters.value.transactionType
    );
  }

  if (filters.value.reverted) {
    filtered = filtered.filter((item) => {
      if (filters.value.reverted === "yes") {
        return item.reverted === true;
      } else if (filters.value.reverted === "no") {
        return !item.reverted;
      }
      return true;
    });
  }

  if (filters.value.status) {
    filtered = filtered.filter(
      (item) => item.status.toLowerCase() === filters.value.status.toLowerCase()
    );
  }

  return filtered;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value
    .slice(start, end)
    .map((transaction, index) => ({
      ...transaction,
      no: start + index + 1,
    }));
});

const totalPages = computed(() =>
  Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
);

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case "rejected":
      return "bg-red-200 text-red-800 px-2 py-1 rounded uppercase";
    case "approved":
      return "bg-green-200 text-green-800 px-2 py-1 rounded uppercase";
    case "pending":
      return "bg-yellow-200 text-yellow-800 px-2 py-1 rounded uppercase";
    default:
      return "bg-gray-200 text-gray-800 px-2 py-1 rounded uppercase";
  }
};

const resetFilters = () => {
  dateFilterRef.value?.handleReset();
  filters.value.transactionType = "";
  filters.value.reverted = "";
  filters.value.status = "";
  searchQuery.value = "";
  currentPage.value = 1;
};

const openReceiptModal = (receiptUrl) => {
  selectedReceiptUrl.value = receiptUrl;
  selectedReceiptUrls.value = [];
  showReceiptModal.value = true;
};

const openBonusReceiptModal = (item) => {
  if (item.imageUrls && item.imageUrls.length > 0) {
    selectedReceiptUrls.value = item.imageUrls;
    selectedReceiptUrl.value = "";
  } else if (item.imageUrl) {
    selectedReceiptUrl.value = item.imageUrl;
    selectedReceiptUrls.value = [];
  }
  showReceiptModal.value = true;
};

const getRowStyle = (type) => {
  switch (type) {
    case "deposit":
      return "bg-green-100 ";
    case "withdraw":
      return "bg-red-100 ";
    case "bonus":
      return "bg-blue-100 ";
    case "user cashout":
      return "bg-purple-100 ";
    default:
      return "";
  }
};

const handleTypeChange = (type) => {
  searchType.value = type;
};

const revertTransaction = async (id, transactionType) => {
  isButtonLoading.value[id] = true;
  try {
    const result = await Swal.fire({
      title: $t("delete_confirmation"),
      text: $t("delete_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;
    let endpoint;
    switch (transactionType) {
      case "deposit":
        endpoint = `revertdeposit`;
        break;
      case "withdraw":
        endpoint = `revertwithdraw`;
        break;
      case "bonus":
        endpoint = `revertbonus`;
        break;
      default:
        throw new Error("Unsupported transaction type");
    }
    const { post } = useApiEndpoint();
    const { data } = await post(`${endpoint}/${id}`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      fetchTransactions();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Revert failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("revert_failed"),
    });
  } finally {
    isButtonLoading.value[id] = false;
  }
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
    if (filteredTransactions.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredTransactions.value.map((item, index) => {
      let amount = 0;
      try {
        if (typeof item.amount === "object" && item.amount !== null) {
          amount = parseFloat(item.amount.toString());
        } else {
          amount = parseFloat(item.amount);
        }
        if (isNaN(amount)) {
          amount = 0;
        }
      } catch (e) {
        console.error("Error parsing amount:", e);
        amount = 0;
      }
      const bankDetails =
        item.transactionType === "bonus"
          ? item.promotionnameEN
          : item.transactionType === "user cashout"
          ? "N/A"
          : `${$t("bank_name")}: ${item.bankname}, ${
              item.bankname === "USDT" ? $t("address") : $t("owner_name")
            }: ${item.ownername}${
              item.bankname !== "USDT"
                ? `, ${$t("transfer_number")}: ${item.transfernumber}`
                : ""
            }`;
      return {
        no: index + 1,
        username: item.username,
        fullname: item.fullname,
        bankDetails: bankDetails,
        method: item.method,
        transactionType: item.transactionType,
        amount: amount.toFixed(2),
        status: item.status,
        remark: item.remark || "-",
        reverted: item.reverted ? $t("yes") : $t("no2"),
        createdAt: formatDate(item.createdAt),
        processBy: item.processBy,
        processTime: item.processtime,
      };
    });
    let filename = "transaction_log";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }
    if (filters.value.transactionType) {
      filename += `_${filters.value.transactionType}`;
    }
    if (filters.value.reverted) {
      filename += `_${filters.value.reverted}`;
    }

    if (filters.value.status) {
      filename += `_${filters.value.status}`;
    }

    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("transaction_log"),
      columns: {
        no: { header: $t("no"), width: 8 },
        username: { header: $t("username"), width: 15 },
        fullname: { header: $t("fullname"), width: 20 },
        bankDetails: { header: $t("bank_details"), width: 40 },
        method: { header: $t("method"), width: 15 },
        transactionType: { header: $t("transaction_type"), width: 15 },
        amount: { header: $t("amount"), width: 15 },
        status: { header: $t("status"), width: 15 },
        remark: { header: $t("remark"), width: 30 },
        reverted: { header: $t("reverted"), width: 10 },
        createdAt: { header: $t("date_time"), width: 20 },
        processBy: { header: $t("process_by"), width: 20 },
        processTime: { header: $t("process_time"), width: 20 },
      },
      formatter: (value, key) => {
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
  dateRange,
  () => {
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchTransactions();
    }
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

onMounted(async () => {
  await fetchTransactions();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Transaction Log",
});
</script>
