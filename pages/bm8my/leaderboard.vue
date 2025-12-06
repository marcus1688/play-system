<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("weekly_turnover_leaderboard") }}
        </h1>
      </div>
      <!-- Action Button -->
      <div
        class="flex items-center gap-3 max-md:gap-2 max-md:w-full max-md:flex-col"
      >
        <LoadingButton
          :loading="isFetchButtonLoading"
          @click="fetchAndStoreData"
          class="px-4 py-2 text-md text-white bg-green-600 rounded lg:hover:bg-green-500 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("fetch_weekly_data") }}
        </LoadingButton>
        <LoadingButton
          :loading="isSaveButtonLoading"
          @click="saveAllEntries"
          class="px-4 py-2 text-md text-white bg-indigo-600 rounded lg:hover:bg-indigo-500 transition-colors max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("save_all") }}
        </LoadingButton>
      </div>
    </div>

    <!-- Content Section -->
    <div class="bg-white rounded-lg shadow">
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
                  {{ $t("username") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase w-48 max-md:px-3 max-md:py-2 max-md:w-auto"
                >
                  {{ $t("total_valid_turnover") }} ({{ currency }})
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(entry, index) in displayEntries"
                :key="index"
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
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                    placeholder="Enter username"
                  />
                </td>
                <td class="px-6 py-3 max-md:px-3 max-md:py-2">
                  <input
                    v-model="entry.totalValidTurnover"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                    placeholder="Enter turnover"
                  />
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
const isFetchButtonLoading = ref(false);
const isSaveButtonLoading = ref(false);
const currency = useCurrency();
const isPageLoading = ref(true);
const { get, post, put } = useApiEndpoint();

const entries = ref([]);
const metadata = ref({});
// Create 20 default entries
const createDefaultEntries = () => {
  return Array.from({ length: 20 }, (_, index) => ({
    username: "",
    totalValidTurnover: 0,
  }));
};

const displayEntries = computed(() => {
  const currentEntries = [...entries.value];

  // Ensure we always have 20 entries
  while (currentEntries.length < 20) {
    currentEntries.push({
      username: "",
      totalValidTurnover: 0,
    });
  }

  return currentEntries.slice(0, 20);
});

const fetchEntries = async () => {
  try {
    const { data } = await get("allweeklyturnover");
    if (data.success) {
      entries.value = data.data || [];
      metadata.value = data.metadata || {};
    }
  } catch (error) {
    console.error("Error fetching weekly turnover entries:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load weekly turnover data",
    });
  }
};

const fetchAndStoreData = async () => {
  isFetchButtonLoading.value = true;
  try {
    const { data } = await post("weeklyturnover/fetch");
    console.log(data);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });

      entries.value = data.data || [];
      metadata.value = data.metadata || {};
      //s await fetchEntries();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error fetching and storing weekly turnover data:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isFetchButtonLoading.value = false;
  }
};

const saveAllEntries = async () => {
  isSaveButtonLoading.value = true;
  try {
    const validEntries = entries.value.filter(
      (entry) => entry.username && entry.totalValidTurnover > 0
    );

    const { data } = await put("weeklyturnover", {
      data: validEntries,
      metadata: metadata.value,
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
    console.error("Error saving entries:", error);
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

onMounted(async () => {
  await fetchEntries();
  if (entries.value.length === 0) {
    entries.value = createDefaultEntries();
  }
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Weekly Turnover",
});
</script>

<style></style>
