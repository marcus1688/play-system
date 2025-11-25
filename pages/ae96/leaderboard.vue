<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("website_leaderboard") }}
        </h1>
      </div>
    </div>

    <!-- Content Section -->
    <div class="bg-white rounded-lg shadow">
      <!-- Tabs -->
      <div class="border-b overflow-x-auto">
        <div class="flex max-md:min-w-max">
          <button
            v-for="category in categories"
            :key="category"
            @click="activeTab = category"
            class="px-6 py-3 text-md font-medium border-b-2 -mb-px whitespace-nowrap max-md:px-4 max-md:py-2 max-md:text-sm"
            :class="[
              activeTab === category
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 lg:hover:text-gray-700 lg:hover:border-gray-300',
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <!-- Table Content -->
      <div>
        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-center">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-20 max-md:px-3 max-md:py-2 max-md:w-16"
                >
                  {{ $t("rank") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                >
                  {{ $t("account") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-48 max-md:px-3 max-md:py-2 max-md:w-auto"
                >
                  {{ $t("valid_bet") }} ({{ currency }})
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-48 max-md:px-3 max-md:py-2 max-md:w-auto"
                >
                  {{ $t("actions") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(entry, index) in entriesByCategory(activeTab)"
                :key="entry._id || index"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ index + 1 }}
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <input
                    v-model="entry.account"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                    placeholder="Enter account"
                  />
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <input
                    v-model="entry.validBet"
                    type="number"
                    min="0"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                    placeholder="Enter valid bet"
                  />
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <div
                    class="flex items-center gap-2 justify-center max-md:flex-col max-md:gap-1"
                  >
                    <LoadingButton
                      :loading="isEntryButtonLoading[entry._id]"
                      @click="saveEntry(entry, activeTab)"
                      class="px-3 py-1 text-md text-white bg-indigo-600 rounded lg:hover:bg-indigo-500 transition-colors max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("save") }}
                    </LoadingButton>
                    <LoadingButton
                      :loading="isDeleteButtonLoading[entry._id]"
                      v-if="entry._id"
                      @click="deleteEntry(entry._id)"
                      class="px-3 py-1 text-md text-white bg-red-600 rounded lg:hover:bg-red-500 transition-colors max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("delete") }}
                    </LoadingButton>
                  </div>
                </td>
              </tr>

              <!-- Add New Entry Row -->
              <tr
                v-if="entriesByCategory(activeTab).length < 10"
                class="bg-gray-50"
              >
                <td
                  class="px-6 py-3 text-sm text-gray-600 max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ entriesByCategory(activeTab).length + 1 }}
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <input
                    v-model="newEntries[activeTab].account"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                    :placeholder="$t('new_account')"
                  />
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <input
                    v-model="newEntries[activeTab].validBet"
                    type="number"
                    min="0"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                    :placeholder="$t('new_valid_bet')"
                  />
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <button
                    @click="addEntry(activeTab)"
                    class="px-3 py-1 text-md text-white bg-indigo-600 rounded lg:hover:bg-indigo-500 transition-colors max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("add") }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isDeleteButtonLoading = ref({});
const isEntryButtonLoading = ref({});
const currency = useCurrency();
const isPageLoading = ref(true);
const { get, post, put, delete: del } = useApiEndpoint();
const categories = ["Sports", "Live Casino", "Slot Games", "Other"];
const activeTab = ref("Sports");

const tableHeaders = [
  { key: "rank", label: "Rank", labelCN: "排名" },
  { key: "account", label: "Account", labelCN: "账户" },
  { key: "validBet", label: "Valid Bet (AUD)", labelCN: "有效投注 (AUD)" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const entries = ref([]);
const newEntries = reactive({
  Sports: { account: "", validBet: 0 },
  "Live Casino": { account: "", validBet: 0 },
  "Slot Games": { account: "", validBet: 0 },
  Other: { account: "", validBet: 0 },
});

const entriesByCategory = (category) => {
  return entries.value.filter((entry) => entry.category === category);
};

const fetchEntries = async () => {
  try {
    const { data } = await get("allleaderboard");
    if (data.success) {
      entries.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching leaderboard entries:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load leaderboard data",
    });
  }
};

const addEntry = async (category) => {
  const newEntry = newEntries[category] || {};
  if (!newEntry.account || !newEntry.validBet) {
    alert("Please fill in all fields");
    return;
  }
  try {
    const { data } = await post("leaderboard", {
      entries: [
        { ...newEntry, category, rank: entriesByCategory(category).length + 1 },
      ],
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      newEntries[category] = {};
      await fetchEntries();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error adding entry:", error);
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

const saveEntry = async (entry, category) => {
  if (!entry.account || !entry.validBet) {
    alert("Account and Valid Bet cannot be empty");
    return;
  }
  isEntryButtonLoading.value[entry._id] = true;
  try {
    const { data } = await put(`leaderboard/${entry._id}`, {
      ...entry,
      category,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      await fetchEntries();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving entry:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
  isEntryButtonLoading.value[entry._id] = false;
};

const deleteEntry = async (entryId) => {
  isDeleteButtonLoading.value[entryId] = true;
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
    if (result.isConfirmed) {
      const { data } = await del(`leaderboard/${entryId}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
        });
        await fetchEntries();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting entry:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isDeleteButtonLoading.value[entryId] = false;
  }
};

onMounted(async () => {
  await fetchEntries();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Leaderboard",
});
</script>
