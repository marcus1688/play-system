<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("company_bank_list") }}
          </h1>
        </div>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('bank_name')"
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
              :key="bank._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.no }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <img
                  v-if="bank.qrimage"
                  :src="bank.qrimage"
                  alt="Bank QR"
                  class="h-10 w-10 object-contain mx-auto max-md:h-8 max-md:w-8"
                />
                <span v-else class="text-sm text-gray-500 max-md:text-xs">{{
                  $t("no_image")
                }}</span>
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
                {{ bank.fastpayment || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.bankaccount }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.transactionlimit || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.transactionfees || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.transactionamountlimit || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ bank.remark }}
              </td>

              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <BaseToggleSwitch
                  v-model="bank.isActive"
                  @update:modelValue="toggleActive(bank)"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="editBank(bank)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[bank._id]"
                    @click="deleteBank(bank)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedBanks.length === 0"
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
    </div>

    <!-- Bank Mangement Modal -->
    <BankManagementModal
      v-model:show="showBankModal"
      :initial-data="editingBank"
      @success="fetchBanks"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isButtonLoading = ref({});
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "编号", sortable: false },
  { key: "qrimage", label: "QR / Bank Logo", labelCN: "二维码/银行标志" },
  { key: "bankname", label: "Bank Name", labelCN: "银行名称", sortable: false },
  {
    key: "ownername",
    label: "Owner Name",
    labelCN: "所有者姓名",
    sortable: false,
  },
  { key: "fastpayment", label: "Fast Payment", labelCN: "快速支付" },
  { key: "bankaccount", label: "Bank Account", labelCN: "银行账户" },
  {
    key: "transactionlimit",
    label: "Transaction Limit",
    labelCN: "交易限制",
    sortable: true,
  },
  {
    key: "transactionfees",
    label: "Transaction Fees",
    labelCN: "交易费用",
    sortable: true,
  },
  {
    key: "transactionamountlimit",
    label: "Transaction Amount Limit",
    labelCN: "交易金额限制",
    sortable: true,
  },
  { key: "remark", label: "Remark", labelCN: "备注", sortable: false },
  { key: "isActive", label: "Activate", labelCN: "激活", sortable: true },
  { key: "actions", label: "Action", labelCN: "操作" },
];

const banks = ref([]);
const showBankModal = ref(false);
const editingBank = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const { publicGet, post, publicPatch, publicDelete: del } = useApiEndpoint();

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

const handleCreate = () => {
  editingBank.value = null;
  showBankModal.value = true;
};

const editBank = (bank) => {
  editingBank.value = bank;
  showBankModal.value = true;
};

const fetchBanks = async () => {
  try {
    const { data } = await publicGet("banklist");
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

const deleteBank = async (bank) => {
  isButtonLoading.value[bank._id] = true;
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

  if (result.isConfirmed) {
    try {
      const { data } = await del(`deletebanklist/${bank._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchBanks();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          error.response?.data?.message?.[$locale.value] ||
          error.response?.data?.message?.en ||
          $t("network_error"),
      });
    }
  }
  isButtonLoading.value[bank._id] = false;
};

const toggleActive = async (bank) => {
  try {
    const { data } = await publicPatch("updateactivebank", {
      id: bank._id,
      isActive: bank.isActive,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchBanks();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    bank.isActive = !bank.isActive;
    console.error("Error toggling status:", error);
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

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchBanks();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Bank",
});
</script>
