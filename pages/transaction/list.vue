<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("transaction_list") }}
        </h1>
      </div>
      <div class="flex gap-3">
        <button
          @click="isNewTransactionModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-indigo-600 lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          <span class="max-sm:hidden">{{ $t("new_transaction") }}</span>
          <span class="sm:hidden">{{ $t("new") }}</span>
        </button>
        <NewTransactionModal
          :is-open="isNewTransactionModalOpen"
          @close="isNewTransactionModalOpen = false"
          @submit="handleTransactionSubmit"
        />
      </div>
    </div>

    <!-- Filter Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div
        class="grid-cols-2 items-center gap-6 mb-6 max-2xl:grid-cols-1 hidden"
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
        <DateFilterButtons ref="dateFilterRef" v-model="dateRange" class="" />
      </div>

      <div
        class="grid grid-cols-2 gap-6 mb-6 max-sm:grid-cols-1 max-md:gap-4 max-md:mb-4"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
            >{{ $t("username") }}:</label
          >
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="px-4 py-2 border rounded-lg w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
          />
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs"
          >
            {{ $t("transaction_type") }}
          </label>
          <CustomSelect v-model="transactionType">
            <option value="" class="py-2">{{ $t("all") }}</option>
            <option value="deposit" class="py-2">{{ $t("deposit") }}</option>
            <option value="withdraw" class="py-2">{{ $t("withdraw") }}</option>
            <option value="bonus" class="py-2">{{ $t("bonus") }}</option>
          </CustomSelect>
        </div>
      </div>

      <div class="justify-end gap-3 hidden">
        <button
          @click="handleReset"
          class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg lg:hover:bg-gray-200 flex items-center gap-2"
        >
          <Icon icon="material-symbols:refresh" />
          {{ $t("reset") }}
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:flex-col max-md:gap-3 max-md:items-start max-md:p-3"
      >
        <div class="flex items-center gap-2 max-md:hidden">
          <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
          <span class="text-xl font-semibold">{{
            $t("pending_transaction")
          }}</span>
          <button
            @click="toggleSound"
            class="px-4 py-1 text-white rounded items-center gap-2 hidden"
            :class="
              isSoundMuted
                ? 'bg-gray-500 lg:hover:bg-gray-400'
                : 'bg-indigo-600 lg:hover:bg-indigo-500'
            "
          >
            <Icon :icon="isSoundMuted ? 'mdi:volume-off' : 'mdi:volume-high'" />
            {{ isSoundMuted ? $t("unmute") : $t("mute") }}
          </button>
        </div>
        <div
          class="flex items-center gap-2 max-md:text-sm max-md:w-full max-md:justify-between"
        >
          <div class="flex items-center gap-2">
            <span class="text-gray-600">{{ $t("refresh_in") }}</span>
            <span class="font-bold">{{ countdown }}</span>
            <span class="text-gray-600">{{ $t("seconds") }}</span>
          </div>
          <LoadingButton
            :loading="isRefreshButtonLoading"
            @click="handleRefresh"
            class="px-4 py-1 text-white bg-indigo-600 lg:hover:bg-indigo-500 rounded flex items-center gap-2 max-md:px-3 max-md:py-2 max-md:text-xs"
          >
            <div class="flex items-center gap-2">
              <Icon icon="material-symbols:refresh" />
              {{ $t("refresh") }}
            </div>
          </LoadingButton>
        </div>
      </div>

      <div class="w-full">
        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="header in tableHeaders"
                  :key="header.key"
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                >
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-center">
              <tr
                v-for="(item, index) in currentItems"
                :key="item.id"
                :class="getRowStyle(item.transactionType)"
                class="font-semibold"
              >
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  <div class="flex flex-col gap-1 items-center">
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
                      {{ item.username }}
                    </div>
                    <button
                      @click="openUserDetails(item.userId)"
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
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ item.fullname }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  <div v-if="item.transactionType !== `bonus`">
                    <span class="block">
                      {{ $t("bank") }}: {{ item.bankname }}
                    </span>
                    <span v-if="item.bankcode" class="block">
                      {{ $t("bank_code") }}: {{ item.bankcode || "-" }}</span
                    >
                    <span class="block">
                      {{ $t("name") }}: {{ item.ownername }}</span
                    >
                    <span class="block">
                      {{ $t("bank_acc") }}: {{ item.transfernumber }}</span
                    >
                    <span v-if="item.fastpay" class="block">
                      {{ $t("fastpay") }}: {{ item.fastpay || "-" }}</span
                    >
                    <span v-if="item.fastpayCode" class="block">
                      {{ $t("fastpay_code") }}:
                      {{ item.fastpayCode || "-" }}</span
                    >
                    <span v-if="item.depositname" class="block">
                      ‼️{{ $t("deposit_name") }}:
                      {{ item.depositname || "-" }}</span
                    >
                  </div>
                  <div v-else>{{ item.promotionnameEN }}</div>
                </td>
                <td
                  class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ item.method }}
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
                  class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ currency }} {{ item.walletamount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 text-sm uppercase max-md:px-3 max-md:py-3">
                  <span
                    class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded uppercase max-md:text-xs max-md:px-1.5 max-md:py-2"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td
                  class="px-6 py-4 text-sm whitespace-pre-line text-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ item.remark }}
                </td>
                <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                  <button
                    v-if="item.transactionType === 'deposit'"
                    @click="openReceiptModal(item.imageUrl)"
                    class="px-4 py-2 bg-blue-500 text-white rounded lg:hover:bg-blue-600 max-md:px-3 max-md:py-1 max-md:text-xs"
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
                  <span v-else
                    ><button
                      disabled
                      class="bg-gray-400 px-4 py-2 rounded text-white cursor-not-allowed max-md:px-3 max-md:py-1 max-md:text-xs"
                    >
                      {{ $t("na") }}
                    </button></span
                  >
                </td>
                <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                  <div
                    class="flex space-x-2 max-md:flex-col max-md:space-x-0 max-md:space-y-1"
                  >
                    <LoadingButton
                      :loading="isApproveButtonLoading[item._id]"
                      @click="handleApprove(item)"
                      class="px-4 py-2 bg-green-500 text-white rounded lg:hover:bg-green-600 max-md:px-3 max-md:py-1 max-md:text-xs"
                    >
                      {{ $t("approve") }}
                    </LoadingButton>
                    <LoadingButton
                      :loading="isRejectButtonLoading[item._id]"
                      @click="handleReject(item)"
                      class="px-4 py-2 bg-red-500 text-white rounded lg:hover:bg-red-600 max-md:px-3 max-md:py-1 max-md:text-xs"
                    >
                      {{ $t("reject") }}
                    </LoadingButton>
                  </div>
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ formatDate(item.createdAt) }}
                </td>
              </tr>
              <tr
                v-if="currentItems.length === 0"
                class="h-[400px] max-md:h-[300px]"
              >
                <td
                  colspan="13"
                  class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
                >
                  <div class="flex flex-col gap-8 items-center max-md:gap-4">
                    <img
                      src="/images/empty2.png"
                      alt="Empty State"
                      class="w-32 h-auto opacity-80 max-md:w-24"
                    />
                    {{ $t("no_pending_transactions") }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <BasePagination
          v-if="currentItems.length !== 0"
          v-model="currentPage"
          :totalPages="totalPages"
        />

        <!-- Receipt Modal -->
        <ReceiptModal
          v-model:show="showReceiptModal"
          :image-url="selectedReceiptUrl"
          :image-urls="selectedReceiptUrls"
        />
        <!-- Withdraw Approval Modal -->
        <WithdrawApprovalModal
          v-model="showWithdrawModal"
          :withdraw-id="selectedWithdrawId"
          :withdrawAmount="selectedWithdrawAmount"
          :userId="selectedWithdrawUserId"
          :username="selectedWithdrawUsername"
          :userBankName="selectedWithdrawBankName"
          :userAccountNumber="selectedWithdrawAccountNumber"
          :userFullname="selectedWithdrawFullname"
          :transactionId="selectedWithdrawTransactionId"
          @confirm="handleWithdrawConfirm"
        />
        <!-- Deposit Approval Modal -->
        <DepositApprovalModal
          v-model="showDepositModal"
          :deposit-id="selectedDepositId"
          :deposit-amount="selectedDepositAmount"
          :deposit-data="selectedDepositData"
          @confirm="handleDepositConfirm"
        />

        <RejectModal
          v-model="showRejectModal"
          :transaction-data="selectedTransactionData"
          :transaction-type="selectedTransactionType"
          @confirm="handleTransactionReject"
        />

        <!-- User Details Modal -->
        <UserDetailsModal
          v-if="showUserDetails && selectedUser"
          v-model:show="showUserDetails"
          :user-data="selectedUser"
          :default-tab="defaultTab"
          @userUpdated="handleUserUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import moment from "moment-timezone";
import { formatDate } from "~/utils/dateFormatter";
import { Icon } from "@iconify/vue";

const selectedWithdrawUsername = ref("");
const selectedWithdrawAccountNumber = ref("");
const { getCompanyId } = useCompany();
const selectedReceiptUrls = ref([]);
const countdown = useState("countdown");
const isSoundMuted = useState("isSoundMuted");
const defaultTab = ref("wallet-logs");
const showRejectModal = ref(false);
const selectedTransactionData = ref({});
const selectedTransactionType = ref("");
const selectedWithdrawData = ref({});
const isRefreshButtonLoading = ref(false);
const isRejectButtonLoading = ref({});
const isApproveButtonLoading = ref({});
const showDepositModal = ref(false);
const selectedDepositId = ref("");
const selectedDepositAmount = ref(0);
const selectedDepositData = ref({});
const selectedWithdrawBankName = ref("");
const selectedWithdrawFullname = ref("");
const selectedWithdrawTransactionId = ref("");

const { get, post } = useApiEndpoint();
const currency = useCurrency();
const dateFilterRef = ref(null);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const username = ref("");
const transactionType = ref("");
const showWithdrawModal = ref(false);
const selectedWithdrawId = ref("");
const selectedWithdrawAmount = ref(0);
const selectedWithdrawUserId = ref("");
const isPageLoading = ref(true);
const showUserDetails = ref(false);
const selectedUser = ref(null);

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  username.value = "";
  transactionType.value = "";
};
const isNewTransactionModalOpen = ref(false);

const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号" },
  { key: "username", label: "Username", labelCN: "用户名" },
  { key: "fullName", label: "Full Name", labelCN: "全名" },
  { key: "bankDetails", label: "Bank Details", labelCN: "银行详情" },
  { key: "method", label: "Method", labelCN: "方式" },
  { key: "transactionType", label: "Transaction Type", labelCN: "交易类型" },
  { key: "amount", label: "Amount", labelCN: "金额" },
  { key: "walletamount", label: "Wallet Amount", labelCN: "余额" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "remark", label: "Remark", labelCN: "备注" },
  { key: "receipt", label: "Receipt", labelCN: "收据" },
  { key: "action", label: "Action", labelCN: "操作" },
  { key: "dateTime", label: "Date & Time", labelCN: "日期和时间" },
];

const fetchTransactions = async () => {
  try {
    const { data } = await get("fallback-latest-transactions");
    if (data.success) {
      pendingDeposits.value = data.data.deposits;
      pendingWithdraws.value = data.data.withdraws;
      pendingBonuses.value = data.data.bonuses;
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
};

const currentPage = ref(1);
const itemsPerPage = ref(10);
const showReceiptModal = ref(false);
const selectedReceiptUrl = ref("");
const getRowStyle = (type) => {
  switch (type) {
    case "deposit":
      return "bg-green-100 ";
    case "withdraw":
      return "bg-red-100 ";
    case "bonus":
      return "bg-blue-100 ";
    default:
      return "";
  }
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

const pendingDeposits = useState("pendingDeposits");
const pendingWithdraws = useState("pendingWithdraws");
const pendingBonuses = useState("pendingBonuses");

const transactions = ref([]);
const updateTransactions = () => {
  transactions.value = [
    ...pendingDeposits.value.map((d) => ({
      ...d,
      transactionType: "deposit",
    })),
    ...pendingWithdraws.value.map((w) => ({
      ...w,
      transactionType: "withdraw",
    })),
    ...pendingBonuses.value.map((b) => ({
      ...b,
      transactionType: "bonus",
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
watch(
  () => [pendingDeposits.value, pendingWithdraws.value, pendingBonuses.value],
  () => {
    updateTransactions();
  },
  { deep: true, immediate: true }
);

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value];
  if (username.value) {
    const searchTerm = username.value.toLowerCase();
    filtered = filtered.filter((item) =>
      item.username.toLowerCase().includes(searchTerm)
    );
  }
  // if (dateRange.value.startDate && dateRange.value.endDate) {
  //   filtered = filtered.filter((item) => {
  //     const itemDate = moment(item.createdAt).tz("Asia/Kuala_Lumpur");
  //     const startDate = moment(dateRange.value.startDate)
  //       .tz("Asia/Kuala_Lumpur")
  //       .startOf("day");
  //     const endDate = moment(dateRange.value.endDate)
  //       .tz("Asia/Kuala_Lumpur")
  //       .endOf("day");
  //     return itemDate.isBetween(startDate, endDate, null, "[]");
  //   });
  // }
  if (transactionType.value) {
    filtered = filtered.filter(
      (item) => item.transactionType === transactionType.value
    );
  }
  return filtered;
});

const currentItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredTransactions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage.value);
});

const handleRefresh = () => {
  isRefreshButtonLoading.value = true;
  Swal.fire({
    icon: "success",
    title: $t("refresh_successful"),
    text: $t("data_refreshed"),
    timer: 1500,
  });
  fetchTransactions();
  isRefreshButtonLoading.value = false;
};

const handleApprove = async (item) => {
  isApproveButtonLoading.value[item._id] = true;
  try {
    if (item.walletamount > 1) {
      const walletConfirmResult = await Swal.fire({
        title: $t("high_wallet_amount_warning"),
        html: `
      <div style="text-align: left;">
        <p><strong>${$t("user")}:</strong> ${item.username}</p>
          <p><strong>${$t("wallet_amount")}:</strong> ${
          currency.value
        } ${item.walletamount.toFixed(2)}</p>
        <p><strong>${$t("transaction_type")}:</strong> ${$t(
          item.transactionType
        )}</p>
        <p><strong>${$t("transaction_amount")}:</strong> ${
          currency.value
        } ${item.amount.toFixed(2)}</p>
      </div>
    `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#e53e3e",
        cancelButtonColor: "#3085d6",
        confirmButtonText: $t("yes_i_confirm_approval"),
        cancelButtonText: $t("cancel"),
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      if (!walletConfirmResult.isConfirmed) {
        return;
      }
    }
    if (item.transactionType === "withdraw") {
      selectedWithdrawId.value = item._id;
      selectedWithdrawAmount.value = item.amount;
      selectedWithdrawUserId.value = item.userId;
      selectedWithdrawUsername.value = item.username;
      selectedWithdrawAccountNumber.value = item.transfernumber;
      selectedWithdrawBankName.value = item.bankname;
      selectedWithdrawFullname.value = item.fullname;
      selectedWithdrawTransactionId.value = item.transactionId;
      showWithdrawModal.value = true;
      return;
    }
    if (item.transactionType === "deposit") {
      if (getCompanyId() === "ae96") {
        const result = await Swal.fire({
          title: $t("confirm_approval"),
          text: $t("approve_transaction_confirmation", {
            type: $t(item.transactionType),
          }),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: $t("yes_approve_it"),
        });

        if (result.isConfirmed) {
          const { data } = await post(`approvedeposit/${item._id}`);
          if (data.success) {
            await Swal.fire({
              icon: "success",
              title: $t("approved"),
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
        }
        return;
      } else {
        selectedDepositId.value = item._id;
        selectedDepositAmount.value = item.amount;
        selectedDepositData.value = item;
        showDepositModal.value = true;
        return;
      }
    }
    const result = await Swal.fire({
      title: $t("confirm_approval"),
      text: $t("approve_transaction_confirmation", {
        type: $t(item.transactionType),
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("yes_approve_it"),
    });

    if (result.isConfirmed) {
      let endpoint;
      switch (item.transactionType) {
        case "bonus":
          endpoint = `approvebonus/${item._id}`;
          break;
      }
      const { data } = await post(endpoint);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("approved"),
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
    }
  } catch (error) {
    console.error("Approval failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("approval_failed_generic"),
    });
  } finally {
    isApproveButtonLoading.value[item._id] = false;
  }
};

// const handleApprove = async (item) => {
//   isApproveButtonLoading.value[item._id] = true;
//   try {
//     if (item.transactionType === "withdraw") {
//       selectedWithdrawId.value = item._id;
//       selectedWithdrawAmount.value = item.amount;
//       selectedWithdrawUserId.value = item.userId;
//       showWithdrawModal.value = true;
//       return;
//     }
//     const result = await Swal.fire({
//       title: $t("confirm_approval"),
//       text: $t("approve_transaction_confirmation", {
//         type: $t(item.transactionType),
//       }),
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: $t("yes_approve_it"),
//     });
//     if (result.isConfirmed) {
//       let endpoint;
//       switch (item.transactionType) {
//         case "deposit":
//           endpoint = `approvedeposit/${item._id}`;
//           break;
//         case "bonus":
//           endpoint = `approvebonus/${item._id}`;
//           break;
//       }
//       const { data } = await post(endpoint);
//       if (data.success) {
//         await Swal.fire({
//           icon: "success",
//           title: $t("approved"),
//           text: data.message[$locale.value] || data.message.en,
//           timer: 1500,
//         });
//         fetchTransactions();
//       } else {
//         await Swal.fire({
//           icon: "info",
//           title: $t("info"),
//           text: data.message[$locale.value] || data.message.en,
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Approval failed:", error);
//     await Swal.fire({
//       icon: "error",
//       title: $t("error"),
//       text:
//         error.response?.data?.message?.[$locale.value] ||
//         error.response?.data?.message?.en ||
//         $t("approval_failed_generic"),
//     });
//   } finally {
//     isApproveButtonLoading.value[item._id] = false;
//   }
// };

const handleWithdrawConfirm = async ({ withdrawId, bankId, cashoutAmount }) => {
  try {
    const { data } = await post(`approvewithdraw/${withdrawId}`, {
      bankId,
      cashoutAmount,
    });
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
    console.error("Withdrawal approval failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("withdrawal_approval_failed"),
    });
  }
};

const handleDepositConfirm = async ({ depositId, depositname }) => {
  try {
    const payload = {};
    if (depositname && depositname.trim()) {
      payload.depositname = depositname.trim();
    }

    const { data } = await post(`approvedeposit/${depositId}`, payload);
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
    console.error("Deposit approval failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("deposit_approval_failed"),
    });
  }
};

const handleTransactionReject = async ({
  transactionId,
  transactionType,
  rejectRemark,
}) => {
  try {
    const endpointMap = {
      withdraw: `rejectwithdraw/${transactionId}`,
      deposit: `rejectdeposit/${transactionId}`,
      bonus: `rejectbonus/${transactionId}`,
    };
    const { data } = await post(endpointMap[transactionType], {
      rejectRemark,
    });
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
    console.error("Transaction rejection failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("transaction_rejection_failed"),
    });
  }
};

const handleReject = async (item) => {
  isRejectButtonLoading.value[item._id] = true;
  try {
    if (["withdraw", "deposit", "bonus"].includes(item.transactionType)) {
      selectedTransactionData.value = item;
      selectedTransactionType.value = item.transactionType;
      showRejectModal.value = true;
      isRejectButtonLoading.value[item._id] = false;
      return;
    }
    // const result = await Swal.fire({
    //   title: $t("confirm_rejection"),
    //   text: $t("reject_transaction_confirmation", {
    //     type: $t(item.transactionType),
    //   }),
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#d33",
    //   cancelButtonColor: "#3085d6",
    //   confirmButtonText: $t("yes_reject_it"),
    // });

    // if (result.isConfirmed) {
    // }
  } catch (error) {
    console.error("Rejection failed:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("rejection_failed_generic"),
    });
  } finally {
    isRejectButtonLoading.value[item._id] = false;
  }
};

const openUserDetails = async (userId) => {
  try {
    const { data } = await get(`user/${userId}`);
    if (data.success) {
      selectedUser.value = data.data;
      defaultTab.value = "wallet-logs";
      showUserDetails.value = true;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch user details",
    });
  }
};

const handleUserUpdated = async () => {
  if (selectedUser.value?._id) {
    try {
      const { data } = await get(`user/${selectedUser.value._id}`);
      if (data.success) {
        selectedUser.value = data.data;
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to refresh user details",
      });
    }
  }
};

const handleTransactionSubmit = () => {
  fetchTransactions();
};

const toggleSound = () => {
  isSoundMuted.value = !isSoundMuted.value;
};

// watch(
//   dateRange,
//   () => {
//     currentPage.value = 1;
//   },
//   { deep: true }
// );

onMounted(() => {
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Transaction List",
});
</script>
