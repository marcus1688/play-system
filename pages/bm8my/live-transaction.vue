<template>
  <div>
    <PageLoading v-if="isPageLoading" />

    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("live_transaction") }}
        </h1>
      </div>

      <div
        class="flex items-center gap-3 max-md:gap-2 max-md:w-full max-md:flex-col"
      >
        <LoadingButton
          :loading="isRefreshButtonLoading"
          @click="refreshTransactions"
          class="px-4 py-2 text-md text-white bg-gray-600 rounded lg:hover:bg-gray-500 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("refresh") }}
        </LoadingButton>
        <LoadingButton
          :loading="isSaveButtonLoading"
          @click="saveAllTransactions"
          class="px-4 py-2 text-md text-white bg-indigo-600 rounded lg:hover:bg-indigo-500 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("save_all") }}
        </LoadingButton>
      </div>
    </div>

    <!-- Deposit Section -->
    <div class="bg-white rounded-lg shadow mb-6 max-md:mb-4">
      <div
        class="px-6 py-4 bg-green-50 border-b border-green-200 max-md:px-4 max-md:py-3"
      >
        <h2 class="text-lg font-semibold text-green-800 max-md:text-base">
          {{ $t("deposit") }} ({{ $t("max") }}: 5)
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-20 max-md:px-3 max-md:py-2 max-md:w-16"
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
                {{ $t("amount") }} ({{ currency }})
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("time") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(entry, index) in depositEntries"
              :key="`deposit-${index}`"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ index + 1 }}
              </td>
              <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                <input
                  v-model="entry.username"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  :placeholder="$t('enter_username')"
                />
              </td>
              <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                <input
                  v-model="entry.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  :placeholder="$t('enter_amount')"
                />
              </td>
              <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                <input
                  v-model="entry.time"
                  type="datetime-local"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Withdraw Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="px-6 py-4 bg-red-50 border-b border-red-200 max-md:px-4 max-md:py-3"
      >
        <h2 class="text-lg font-semibold text-red-800 max-md:text-base">
          {{ $t("withdraw") }} ({{ $t("max") }}: 5)
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-20 max-md:px-3 max-md:py-2 max-md:w-16"
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
                {{ $t("amount") }} ({{ currency }})
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("time") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(entry, index) in withdrawEntries"
              :key="`withdraw-${index}`"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ index + 1 }}
              </td>
              <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                <input
                  v-model="entry.username"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  :placeholder="$t('enter_username')"
                />
              </td>
              <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                <input
                  v-model="entry.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  :placeholder="$t('enter_amount')"
                />
              </td>
              <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                <input
                  v-model="entry.time"
                  type="datetime-local"
                  class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const { publicGet, publicPut } = useApiEndpoint();
const currency = useCurrency();
const isPageLoading = ref(true);
const isSaveButtonLoading = ref(false);
const isRefreshButtonLoading = ref(false);
const createDefaultEntries = () => {
  return Array.from({ length: 5 }, () => ({
    username: "",
    amount: 0,
    time: "",
  }));
};

const depositEntries = ref(createDefaultEntries());
const withdrawEntries = ref(createDefaultEntries());

const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fetchTransactions = async () => {
  try {
    const { data } = await publicGet("transactions/list");
    if (data.success) {
      if (data.data.deposits && data.data.deposits.length > 0) {
        const sortedDeposits = data.data.deposits.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );

        depositEntries.value = sortedDeposits.map((item) => ({
          username: item.username || "",
          amount: item.amount || 0,
          time: item.time ? formatDateTimeLocal(item.time) : "",
        }));
        while (depositEntries.value.length < 5) {
          depositEntries.value.push({ username: "", amount: 0, time: "" });
        }
      }
      if (data.data.withdraws && data.data.withdraws.length > 0) {
        const sortedWithdraws = data.data.withdraws.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );

        withdrawEntries.value = sortedWithdraws.map((item) => ({
          username: item.username || "",
          amount: item.amount || 0,
          time: item.time ? formatDateTimeLocal(item.time) : "",
        }));
        while (withdrawEntries.value.length < 5) {
          withdrawEntries.value.push({ username: "", amount: 0, time: "" });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_data"),
    });
  }
};

const saveAllTransactions = async () => {
  isSaveButtonLoading.value = true;
  try {
    const validDeposits = depositEntries.value.filter(
      (entry) => entry.username && entry.amount > 0
    );
    const validWithdraws = withdrawEntries.value.filter(
      (entry) => entry.username && entry.amount > 0
    );
    if (validDeposits.length === 0 && validWithdraws.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: $t("warning"),
        text: $t("please_fill_at_least_one_entry"),
      });
      return;
    }
    const deposits = validDeposits.map((entry) => ({
      username: entry.username,
      amount: parseFloat(entry.amount),
      time: entry.time || undefined,
    }));

    const withdraws = validWithdraws.map((entry) => ({
      username: entry.username,
      amount: parseFloat(entry.amount),
      time: entry.time || undefined,
    }));

    const { data } = await publicPut("transactions/list", {
      deposits,
      withdraws,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });

      await fetchTransactions();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving transactions:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isSaveButtonLoading.value = false;
  }
};

const refreshTransactions = async () => {
  isRefreshButtonLoading.value = true;
  try {
    await fetchTransactions();
    await Swal.fire({
      icon: "success",
      title: $t("success"),
      text: $t("data_refreshed"),
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error refreshing transactions:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_data"),
    });
  } finally {
    isRefreshButtonLoading.value = false;
  }
};

onMounted(async () => {
  await fetchTransactions();
  if (depositEntries.value.length === 0) {
    depositEntries.value = createDefaultEntries();
  }
  if (withdrawEntries.value.length === 0) {
    withdrawEntries.value = createDefaultEntries();
  }

  isPageLoading.value = false;
});

useHead({
  title: "Money System | Transaction List",
});
</script>
