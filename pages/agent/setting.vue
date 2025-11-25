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
            {{ $t("agent_setting") }}
          </h1>
        </div>
      </div>
      <!-- Action Buttons -->
      <div class="flex items-center gap-4 max-md:w-full">
        <LoadingButton
          :loading="isButtonLoading"
          @click="saveSettings"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <div class="flex items-center gap-2">
            {{ $t("save") }}
          </div>
        </LoadingButton>
      </div>
    </div>

    <!-- Schedule Settings -->
    <!-- <AgentScheduleSettings v-model="scheduleSettings" /> -->

    <!-- Max Downline Settings -->
    <div
      v-if="adminUserData?.role === 'superadmin'"
      class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4"
    >
      <h2
        class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("max_downline") }}
      </h2>
      <CustomSelect v-model="maxDownline">
        <option v-for="n in 5" :key="n" :value="String(n)">{{ n }}</option>
      </CustomSelect>
    </div>

    <!-- Commission Algorithm Selection -->
    <div
      v-if="adminUserData?.role === 'superadmin'"
      class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4"
    >
      <h2
        class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
      >
        {{ $t("select_agent_commission_calculation") }}
      </h2>
      <CustomSelect v-model="selectedAlgorithm">
        <option value="turnover">{{ $t("based_on_turnover") }}</option>
        <option value="winlose">{{ $t("based_on_win_lose") }}</option>
      </CustomSelect>
    </div>

    <!-- Turnover Settings -->
    <template v-if="selectedAlgorithm === 'turnover'">
      <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
        <h2
          class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
        >
          {{ $t("set_percentage_for_each_game_category") }}
        </h2>

        <!-- Tabs -->
        <div class="border-b border-gray-200 overflow-x-auto">
          <nav class="flex -mb-px max-md:min-w-max">
            <button
              v-for="level in Array.from(
                { length: downlineCount },
                (_, i) => i + 1
              )"
              :key="level"
              @click="currentTab = level"
              class="mr-2 whitespace-nowrap max-md:mr-1"
              :class="[
                'px-4 py-2 font-medium text-sm max-md:px-3 max-md:py-1.5 max-md:text-xs',
                'focus:outline-none',
                currentTab === level
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 lg:hover:text-gray-700 lg:hover:border-gray-300',
              ]"
            >
              {{ $t("downline") }} {{ level }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mt-6 max-md:mt-4">
          <div
            v-for="level in Array.from(
              { length: downlineCount },
              (_, i) => i + 1
            )"
            :key="level"
            v-show="currentTab === level"
          >
            <div class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
              <div
                v-for="category in categories"
                :key="category._id + level"
                class="flex items-center gap-4 max-md:gap-2"
              >
                <label
                  class="text-sm font-medium text-gray-700 w-1/3 max-md:text-xs max-md:w-auto max-md:min-w-[80px]"
                  >{{ category.name }}</label
                >
                <input
                  type="number"
                  v-model.number="commissionPercentages[level][category.name]"
                  :placeholder="$t('enter_percentage')"
                  min="0"
                  max="100"
                  class="w-24 px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:w-20 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                />
                <span class="text-gray-500 text-sm max-md:text-xs">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Win/Lose Settings -->
    <template v-else>
      <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
        <h2
          class="text-lg font-medium text-gray-700 mb-4 max-md:text-base max-md:mb-3"
        >
          {{ $t("set_percentage_for_win_lose") }}
        </h2>

        <!-- Tabs -->
        <div class="border-b border-gray-200 overflow-x-auto">
          <nav class="flex max-md:min-w-max">
            <button
              v-for="level in Array.from(
                { length: downlineCount },
                (_, i) => i + 1
              )"
              :key="level"
              @click="currentTab = level"
              class="mr-2 whitespace-nowrap max-md:mr-1"
              :class="[
                'px-4 py-2 font-medium text-sm max-md:px-3 max-md:py-1.5 max-md:text-xs',
                'focus:outline-none',
                currentTab === level
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 lg:hover:text-gray-700 lg:hover:border-gray-300',
              ]"
            >
              {{ $t("downline") }} {{ level }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="mt-6 max-md:mt-4">
          <div
            v-for="level in Array.from(
              { length: downlineCount },
              (_, i) => i + 1
            )"
            :key="level"
            v-show="currentTab === level"
          >
            <div class="flex items-center gap-4 max-md:gap-2 max-md:flex-wrap">
              <label
                class="text-sm font-medium text-gray-700 max-md:text-xs max-md:w-full"
                >{{ $t("commission_percentage") }}</label
              >
              <div class="flex items-center gap-2 max-md:flex-1">
                <input
                  type="number"
                  v-model.number="winLoseCommission[level]"
                  min="0"
                  max="100"
                  class="w-24 px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:w-20 max-md:px-2 max-md:py-1.5 max-md:text-sm max-md:flex-1"
                />
                <span class="text-gray-500 text-sm max-md:text-xs">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const adminUserData = useState("adminUserData");
const isButtonLoading = ref(false);
const isPageLoading = ref(true);
const { get, post } = useApiEndpoint();
const selectedAlgorithm = ref("turnover");
const scheduleSettings = ref({
  type: "weekly",
  weekDay: "1",
  monthDay: 1,
  hour: "03",
  minute: "00",
  isActive: true,
});
const currentTab = ref(1);
const maxDownline = ref("1");
const downlineCount = computed(() => parseInt(maxDownline.value));
const categories = ref([]);
const commissionPercentages = ref({
  1: {},
});
const winLoseCommission = ref({});

const initializeCommissionData = () => {
  for (let i = 1; i <= maxDownline.value; i++) {
    if (!commissionPercentages.value[i]) {
      commissionPercentages.value[i] = {};
    }
    categories.value.forEach((category) => {
      if (!commissionPercentages.value[i][category.name]) {
        commissionPercentages.value[i][category.name] = 0;
      }
    });
  }
};

watch(maxDownline, (newValue) => {
  if (currentTab.value > newValue) {
    currentTab.value = newValue;
  }
  initializeCommissionData();
});

const fetchCategories = async () => {
  try {
    const { data } = await get("kioskcategories");
    if (data.success) {
      categories.value = data.data;
      initializeCommissionData();
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
    const { data } = await get("agent-commission");
    if (data.success) {
      scheduleSettings.value = {
        type: data.data.type || "weekly",
        weekDay: data.data.weekDay || "1",
        monthDay: data.data.monthDay || 1,
        hour: data.data.hour?.toString().padStart(2, "0") || "03",
        minute: data.data.minute?.toString().padStart(2, "0") || "00",
        isActive: data.data.isActive ?? true,
      };
      selectedAlgorithm.value = data.data.calculationType || "turnover";
      maxDownline.value = String(data.data.maxDownline || "1");
      if (data.data.calculationType === "winlose") {
        winLoseCommission.value = {};
        for (let i = 1; i <= parseInt(maxDownline.value); i++) {
          winLoseCommission.value[i] = data.data.winLoseCommission?.[i] ?? 0;
        }
      } else {
        commissionPercentages.value = {};
        for (let i = 1; i <= parseInt(maxDownline.value); i++) {
          commissionPercentages.value[i] = {};
          if (categories.value.length > 0) {
            categories.value.forEach((category) => {
              commissionPercentages.value[i][category.name] =
                data.data.commissionPercentages?.[i]?.[category.name] ?? 0;
            });
          }
        }
      }
      initializeCommissionData();
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
      maxDownline: parseInt(maxDownline.value),
      winLoseCommission: winLoseCommission.value,
      commissionPercentages: commissionPercentages.value,
    };

    const { data } = await post("agent-commission", settings);

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
  title: "Money System | Agent Setting",
});
</script>
