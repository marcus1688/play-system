<template>
  <div>
    <PageLoading v-if="isPageLoading" />

    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("affiliate_generation_settings") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Settings Form Section -->
    <div class="bg-white p-6 rounded-lg shadow mb-6 max-md:p-4 max-md:mb-4">
      <div class="space-y-8 max-md:space-y-6">
        <!-- API Fees Rate Setting -->
        <div class="border-b pb-6 max-md:pb-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-md:gap-4">
            <div>
              <h3
                class="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2 max-md:text-base max-md:mb-1.5"
              >
                <Icon
                  icon="material-symbols:api"
                  class="w-5 h-5 text-purple-600 max-md:w-4 max-md:h-4"
                />
                {{ $t("api_fees_rate") }}
              </h3>
              <p class="text-sm text-gray-600 mb-4 max-md:text-xs max-md:mb-3">
                {{ $t("api_fees_rate_description") }}
              </p>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("default_rate") }} (%)
                </label>
                <div class="relative">
                  <input
                    v-model.number="settings.defaultRates.apiFees"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    class="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:pr-7 max-md:pl-3 max-md:py-2 max-md:text-sm"
                    :class="{ 'border-red-300': errors.apiFees }"
                    @input="validateApiFeesRate"
                  />
                  <span
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium max-md:right-2.5 max-md:text-xs"
                  >
                    %
                  </span>
                </div>
                <p v-if="errors.apiFees" class="text-red-500 text-xs mt-1">
                  {{ errors.apiFees }}
                </p>
              </div>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg max-md:p-3">
              <h4
                class="text-sm font-medium text-purple-800 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("example_calculation") }}
              </h4>
              <div class="text-sm text-purple-700 space-y-1 max-md:text-xs">
                <p>
                  {{ $t("deposit") }}: {{ currency }} {{ formatAmount(80000) }}
                </p>
                <p>
                  {{ $t("bonus") }}: {{ currency }} {{ formatAmount(20000) }}
                </p>
                <p>
                  {{ $t("withdraw") }}: {{ currency }} {{ formatAmount(30000) }}
                </p>
                <p>{{ $t("rate") }}: {{ settings.defaultRates.apiFees }}%</p>
                <hr class="border-purple-200 my-2 max-md:my-1.5" />
                <div class="space-y-1">
                  <p class="text-xs text-purple-600">
                    {{ $t("calculation") }}: ({{ currency }}
                    {{ formatAmount(80000) }} + {{ currency }}
                    {{ formatAmount(20000) }} - {{ currency }}
                    {{ formatAmount(30000) }}) ×
                    {{ settings.defaultRates.apiFees }}%
                  </p>
                  <p class="font-medium">
                    {{ $t("api_fees") }}: {{ currency }}
                    {{
                      formatAmount(
                        ((80000 + 20000 - 30000) *
                          settings.defaultRates.apiFees) /
                          100
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Position Taking Rate Setting -->
        <div class="border-b pb-6 max-md:pb-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-md:gap-4">
            <div>
              <h3
                class="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2 max-md:text-base max-md:mb-1.5"
              >
                <Icon
                  icon="material-symbols:trending-up"
                  class="w-5 h-5 text-blue-600 max-md:w-4 max-md:h-4"
                />
                {{ $t("position_taking_rate") }}
              </h3>
              <p class="text-sm text-gray-600 mb-4 max-md:text-xs max-md:mb-3">
                {{ $t("position_taking_rate_description") }}
              </p>

              <div>
                <label
                  class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
                >
                  {{ $t("default_rate") }} (%)
                </label>
                <div class="relative">
                  <input
                    v-model.number="settings.defaultRates.positionTaking"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    class="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 max-md:pr-7 max-md:pl-3 max-md:py-2 max-md:text-sm"
                    :class="{ 'border-red-300': errors.positionTaking }"
                    @input="validatePositionTakingRate"
                  />
                  <span
                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium max-md:right-2.5 max-md:text-xs"
                  >
                    %
                  </span>
                </div>
                <p
                  v-if="errors.positionTaking"
                  class="text-red-500 text-xs mt-1"
                >
                  {{ errors.positionTaking }}
                </p>
              </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg max-md:p-3">
              <h4
                class="text-sm font-medium text-blue-800 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("example_calculation") }}
              </h4>
              <div class="text-sm text-blue-700 space-y-1 max-md:text-xs">
                <p>
                  {{ $t("deposit") }}: {{ currency }} {{ formatAmount(100000) }}
                </p>
                <p>
                  {{ $t("withdraw") }}: {{ currency }} {{ formatAmount(30000) }}
                </p>
                <p>
                  {{ $t("api_fee") }}: {{ currency }} {{ formatAmount(25000) }}
                </p>
                <p>
                  {{ $t("rate") }}: {{ settings.defaultRates.positionTaking }}%
                </p>
                <hr class="border-blue-200 my-2 max-md:my-1.5" />
                <div class="space-y-1">
                  <p class="text-xs text-blue-600">
                    {{ $t("calculation") }}: ({{ currency }}
                    {{ formatAmount(100000) }} - {{ currency }}
                    {{ formatAmount(30000) }} - {{ currency }}
                    {{ formatAmount(25000) }}) ×
                    {{ settings.defaultRates.positionTaking }}%
                  </p>
                  <p class="font-medium">
                    {{ $t("position_taking_amount") }}: {{ currency }}
                    {{
                      formatAmount(
                        ((100000 - 30000 - 25000) *
                          settings.defaultRates.positionTaking) /
                          100
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Important Information -->
        <div class="bg-gray-50 p-6 rounded-lg max-md:p-4">
          <h4
            class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 max-md:text-base max-md:mb-3"
          >
            <Icon
              icon="material-symbols:info"
              class="w-5 h-5 text-blue-600 max-md:w-4 max-md:h-4"
            />
            {{ $t("important_information") }}
          </h4>
          <div
            class="space-y-3 text-sm text-gray-700 max-md:space-y-2 max-md:text-xs"
          >
            <div class="flex items-start gap-3 max-md:gap-2">
              <div
                class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 max-md:mt-1.5"
              ></div>
              <p>{{ $t("info_1") }}</p>
            </div>
            <div class="flex items-start gap-3 max-md:gap-2">
              <div
                class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 max-md:mt-1.5"
              ></div>
              <p>{{ $t("info_2") }}</p>
            </div>
            <div class="flex items-start gap-3 max-md:gap-2">
              <div
                class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 max-md:mt-1.5"
              ></div>
              <p>{{ $t("info_3") }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        class="flex justify-end items-center pt-6 mt-6 border-t max-md:pt-4 max-md:mt-4 max-md:justify-stretch"
      >
        <button
          @click="saveSettings"
          type="button"
          :disabled="saving"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 justify-center max-md:px-4 max-md:py-1.5 max-md:text-sm max-md:w-full"
        >
          <Icon
            v-if="saving"
            icon="material-symbols:progress-activity"
            class="w-4 h-4 animate-spin max-md:w-3.5 max-md:h-3.5"
          />
          <Icon
            v-else
            icon="material-symbols:save"
            class="w-4 h-4 max-md:w-3.5 max-md:h-3.5"
          />
          {{ saving ? $t("saving") : $t("save_settings") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";
const { get, put } = useApiEndpoint();
const currency = useCurrency();
// Reactive variables
const isPageLoading = ref(true);
const loading = ref(false);
const saving = ref(false);
const lastUpdated = ref(null);

const settings = ref({
  defaultRates: {
    apiFees: 0,
    positionTaking: 0,
  },
});

const errors = ref({
  apiFees: "",
  positionTaking: "",
});

const message = ref({
  show: false,
  type: "",
  text: "",
});

// Methods
const validateApiFeesRate = () => {
  const rate = settings.value.defaultRates.apiFees;
  if (rate == null || rate === "") {
    errors.value.apiFees = "API fees rate is required";
  } else if (rate < 0) {
    errors.value.apiFees = "Rate cannot be negative";
  } else if (rate > 100) {
    errors.value.apiFees = "Rate cannot exceed 100%";
  } else {
    errors.value.apiFees = "";
  }
};

const validatePositionTakingRate = () => {
  const rate = settings.value.defaultRates.positionTaking;
  if (rate == null || rate === "") {
    errors.value.positionTaking = "Position taking rate is required";
  } else if (rate < 0) {
    errors.value.positionTaking = "Rate cannot be negative";
  } else if (rate > 100) {
    errors.value.positionTaking = "Rate cannot exceed 100%";
  } else {
    errors.value.positionTaking = "";
  }
};

const loadSettings = async () => {
  loading.value = true;

  try {
    const { data } = await get("affiliate-generation-settings");
    if (data.success) {
      settings.value = { ...data.data };
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error loading settings:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: data.message[$locale.value] || data.message.en,
    });
  } finally {
    loading.value = false;
  }
};

const saveSettings = async () => {
  saving.value = true;
  hideMessage();

  try {
    const { put } = useApiEndpoint();
    const { data } = await put("affiliate-generation-settings", settings.value);

    if (data.success) {
      loadSettings();

      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: $t("settings_saved_successfully"),
      });
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving settings:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: data.message[$locale.value] || data.message.en,
    });
  } finally {
    saving.value = false;
  }
};

const showMessage = (type, text) => {
  message.value = {
    show: true,
    type,
    text,
  };

  // Auto hide after 5 seconds
  setTimeout(() => {
    hideMessage();
  }, 5000);
};

const hideMessage = () => {
  message.value.show = false;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Load settings on mount
onMounted(async () => {
  await loadSettings();
  isPageLoading.value = false;
});

// Watch for changes and validate
watch(
  () => settings.value.defaultRates.apiFees,
  () => {
    if (settings.value.defaultRates.apiFees !== null) {
      validateApiFeesRate();
    }
  }
);

watch(
  () => settings.value.defaultRates.positionTaking,
  () => {
    if (settings.value.defaultRates.positionTaking !== null) {
      validatePositionTakingRate();
    }
  }
);

useHead({
  title: "Affiliate Generation Settings",
});
</script>
