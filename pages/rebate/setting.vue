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
            {{ $t("rebate_setting") }}
          </h1>
        </div>
      </div>
      <!-- Action Buttons -->
      <div class="flex items-center gap-4 max-md:w-full">
        <LoadingButton
          :loading="isButtonLoading"
          @click="saveSettings"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:justify-center"
        >
          <div class="flex items-center gap-2">
            {{ $t("save") }}
          </div>
        </LoadingButton>
      </div>
    </div>

    <!-- Schedule Settings -->
    <div
      class="bg-white p-6 rounded-lg shadow mb-6 hidden max-md:p-4 max-md:mb-4"
    >
      <h2
        class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("schedule_settings") }}
      </h2>
      <div
        class="grid grid-cols-2 gap-6 mb-4 max-md:grid-cols-1 max-md:gap-4 max-md:mb-3"
      >
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("hour") }}</label
          >
          <CustomSelect v-model="scheduleSettings.hour">
            <option
              v-for="h in 24"
              :key="h - 1"
              :value="(h - 1).toString().padStart(2, '0')"
            >
              {{ (h - 1).toString().padStart(2, "0") }}:00
            </option>
          </CustomSelect>
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("minute") }}</label
          >
          <CustomSelect v-model="scheduleSettings.minute">
            <option
              v-for="m in 60"
              :key="m - 1"
              :value="(m - 1).toString().padStart(2, '0')"
            >
              {{ (m - 1).toString().padStart(2, "0") }}
            </option>
          </CustomSelect>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <BaseToggleSwitch v-model="scheduleSettings.isActive" />
        <span class="text-sm text-gray-600 max-md:text-xs">
          {{
            scheduleSettings.isActive
              ? $t("schedule_active")
              : $t("schedule_inactive")
          }}
        </span>
      </div>
    </div>

    <!-- Rebate Algorithm Selection -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <h2
        class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("select_rebate_calculation") }}
      </h2>
      <CustomSelect v-model="selectedAlgorithm">
        <option value="turnover">{{ $t("based_on_turnover") }}</option>
        <option value="winlose">{{ $t("based_on_winlose") }}</option>
      </CustomSelect>
    </div>

    <!-- Turnover Settings -->
    <div
      v-if="selectedAlgorithm === 'turnover'"
      class="bg-white p-6 rounded-lg shadow max-md:p-4"
    >
      <h2
        class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("set_percentage_category") }}
      </h2>
      <div class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
        <div
          v-for="category in categories"
          :key="category._id"
          class="flex items-center gap-4 max-md:gap-2"
        >
          <label
            class="text-sm font-medium text-gray-700 w-1/3 max-md:text-xs max-md:w-auto max-md:flex-1"
            >{{ category.name }}</label
          >
          <input
            type="number"
            v-model.number="rebatePercentages[category.name]"
            :placeholder="$t('enter_percentage')"
            min="0"
            max="100"
            class="w-24 px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:w-20 max-md:px-2 max-md:py-1.5 max-md:text-sm"
          />
          <span class="text-gray-500 text-sm max-md:text-xs">%</span>
        </div>
      </div>
    </div>

    <!-- Win/Lose Settings -->
    <div v-else class="bg-white p-6 rounded-lg shadow max-md:p-4">
      <h2
        class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("set_percentage_winlose") }}
      </h2>
      <div class="flex items-center gap-4 max-md:gap-2 max-md:flex-wrap">
        <label
          class="text-sm font-medium text-gray-700 max-md:text-xs max-md:w-full"
          >{{ $t("rebate_percentage") }}</label
        >
        <div class="flex items-center gap-2">
          <input
            type="number"
            v-model.number="winLoseRebate"
            placeholder="Enter %"
            min="0"
            max="100"
            class="w-24 px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:w-20 max-md:px-2 max-md:py-1.5 max-md:text-sm"
          />
          <span class="text-gray-500 text-sm max-md:text-xs">%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const isButtonLoading = ref(false);
const isPageLoading = ref(true);
const { get, post } = useApiEndpoint();
const selectedAlgorithm = ref("turnover");
const scheduleSettings = ref({
  hour: "03",
  minute: "00",
  isActive: true,
});
const categories = ref([]);
const rebatePercentages = reactive({});
const winLoseRebate = ref(0);

const fetchCategories = async () => {
  try {
    const { data } = await get("kioskcategories");
    if (data.success) {
      categories.value = data.data;
      categories.value.forEach((category) => {
        rebatePercentages[category.name] = 0;
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch categories",
    });
  }
};

const fetchCurrentSettings = async () => {
  try {
    const { data } = await get("rebate-schedule");
    if (data.success) {
      scheduleSettings.value = {
        hour: data.data.hour.toString().padStart(2, "0"),
        minute: data.data.minute.toString().padStart(2, "0"),
        isActive: data.data.isActive,
      };
      selectedAlgorithm.value = data.data.calculationType;
      if (data.data.calculationType === "winlose") {
        winLoseRebate.value = data.data.winLosePercentage;
      } else {
        Object.assign(rebatePercentages, data.data.categoryPercentages);
      }
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load settings",
    });
  }
};

const saveSettings = async () => {
  isButtonLoading.value = true;
  try {
    const settings = {
      ...scheduleSettings.value,
      calculationType: selectedAlgorithm.value,
      winLosePercentage: winLoseRebate.value,
      categoryPercentages: rebatePercentages,
    };

    const { data } = await post("rebate-schedule", settings);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving settings:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchCurrentSettings();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Rebate Setting",
});
</script>
