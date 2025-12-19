<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("bank_balance") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-2 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Bank Name"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
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
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="bank in paginatedBanks"
              :key="bank.id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.bankname }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.ownername }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.bankaccount }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.fastpayment || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(bank.createdAt) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.remark || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="bank.bankname === `USDT`">USDT</span>
                <span v-else>{{ currency }}</span>
                {{ formatAmount(bank.startingbalance) }}
              </td>
              <td
                class="px-6 py-4 text-sm font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span v-if="bank.bankname === `USDT`">USDT</span>
                <span v-else>{{ currency }}</span>
                {{ formatAmount(bank.currentbalance) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    v-if="['localhost', 'hkwin88'].includes(getCompanyId())"
                    @click="handleTransactionFees(bank)"
                    class="px-3 py-1 bg-purple-600 text-white rounded lg:hover:bg-purple-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("transaction_fees") }}
                  </button>
                  <button
                    @click="handleCashIn(bank)"
                    class="px-3 py-1 bg-blue-500 text-white rounded lg:hover:bg-blue-600 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("cash_in") }}
                  </button>
                  <button
                    @click="handleCashOut(bank)"
                    class="px-3 py-1 bg-orange-400 text-white rounded lg:hover:bg-orange-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("cash_out") }}
                  </button>

                  <button
                    @click="handleTransfer(bank)"
                    class="hidden px-3 py-1 bg-green-600 text-white rounded lg:hover:bg-green-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("transfer") }}
                  </button>
                  <button
                    @click="handleStartingBalance(bank)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("starting_balance_action") }}
                  </button>
                </div>
              </td>
            </tr>
            <!-- Totals Row -->
            <tr
              v-if="paginatedBanks.length > 0"
              class="bg-gray-100 font-semibold"
            >
              <td
                colspan="8"
                class="px-6 py-4 text-sm text-right text-gray-700 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ $t("total") }}:
              </td>
              <td
                class="px-6 py-4 text-sm font-semibold max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ formatAmount(totalCurrentBalance) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3"></td>
            </tr>
            <tr
              v-if="paginatedBanks.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="10"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_banks_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedBanks.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />

      <BankBalanceModal
        v-if="currentBank && transactionType"
        v-model:show="showTransactionModal"
        :type="transactionType"
        :bank-data="currentBank"
        @success="fetchBanks"
      />

      <BankTransferModal
        v-model:show="showTransferModal"
        :banks="banks"
        :default-from-bank="currentBank"
        @success="fetchBanks"
      />

      <TransactionFeesCashOutModal
        v-model:show="showTransactionFeesModal"
        :bank-data="currentBank"
        @success="fetchBanks"
      />
    </div>
  </div>
</template>
<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";

const showTransactionFeesModal = ref(false);
const showTransferModal = ref(false);
const isPageLoading = ref(true);
const { getCompanyId } = useCompany();
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号" },
  { key: "bankName", label: "Bank Name", labelCN: "银行名称", sortable: false },
  {
    key: "ownerName",
    label: "Owner Name",
    labelCN: "所有者姓名",
    sortable: false,
  },
  { key: "bankAccount", label: "Bank Account", labelCN: "银行账户" },
  { key: "fastPayment", label: "Fast Payment", labelCN: "快速支付" },
  {
    key: "createdDate",
    label: "Created Date",
    labelCN: "创建日期",
    sortable: true,
  },
  { key: "remark", label: "Remark", labelCN: "备注", sortable: false },
  {
    key: "startingBalance",
    label: "Starting Balance",
    labelCN: "起始余额",
    sortable: true,
  },
  {
    key: "currentBalance",
    label: "Current Balance",
    labelCN: "当前余额",
    sortable: true,
  },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const currency = useCurrency();
const { get, post, patch, delete: del } = useApiEndpoint();
const banks = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showTransactionModal = ref(false);
const currentBank = ref(null);
const transactionType = ref("");

const handleTransactionFees = (bank) => {
  currentBank.value = bank;
  showTransactionFeesModal.value = true;
};

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

const handleTransfer = (bank) => {
  currentBank.value = bank;
  showTransferModal.value = true;
};

const filteredBanks = computed(() => {
  let filtered = [...banks.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.ownername.toLowerCase().includes(searchTerm) ||
        item.bankname.toLowerCase().includes(searchTerm) ||
        `${item.bankaccount || ""}`.includes(searchTerm) ||
        `${item.fastpayment || ""}`.includes(searchTerm)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (sortConfig.value.key === "createdDate") {
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

const totalPages = computed(() =>
  Math.ceil(filteredBanks.value.length / itemsPerPage.value)
);

const paginatedBanks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBanks.value.slice(start, end).map((banks, index) => ({
    ...banks,
    no: start + index + 1,
  }));
});

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleCashIn = (bank) => {
  currentBank.value = bank;
  transactionType.value = "cashin";
  showTransactionModal.value = true;
};

const handleCashOut = (bank) => {
  currentBank.value = bank;
  transactionType.value = "cashout";
  showTransactionModal.value = true;
};

const handleStartingBalance = (bank) => {
  currentBank.value = bank;
  transactionType.value = "startingbalance";
  showTransactionModal.value = true;
};

const totalCurrentBalance = computed(() => {
  return filteredBanks.value.reduce((sum, bank) => {
    return sum + (Number(bank.currentbalance) || 0);
  }, 0);
});

const fetchBanks = async () => {
  try {
    const { data } = await get("banklist");
    if (data.success) {
      banks.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load banks",
    });
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchBanks();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Bank Balance",
});
</script>
