<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <PageLoading v-if="isPageLoading" />
      <div class="bg-white rounded-lg w-full max-w-3xl p-6 max-md:p-4">
        <h2 class="text-2xl font-bold mb-4 max-md:text-xl max-md:mb-3">
          {{ $t("lucky_spin_settings") }}
        </h2>

        <!-- Setting Form -->
        <div class="space-y-4 max-md:space-y-3">
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead>
                <tr>
                  <th
                    class="px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("name") }}
                  </th>
                  <th
                    class="px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("angle") }}
                  </th>
                  <th
                    class="px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("value") }}
                  </th>
                  <th
                    class="px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("probability") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(prize, index) in displayPrizes" :key="index">
                  <td
                    class="border px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  >
                    {{ prize.name }}
                  </td>
                  <td
                    class="border px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  >
                    {{ prize.angle }}°
                  </td>
                  <td
                    class="border px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-sm"
                  >
                    ${{ prize.value }}
                  </td>
                  <td class="border px-4 py-2 max-md:px-2 max-md:py-1.5">
                    <input
                      v-model.number="customProbabilities[index]"
                      type="number"
                      class="w-24 p-1 border rounded max-md:w-16 max-md:text-sm"
                      min="0"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Remaining Count Input -->
          <div
            class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
          >
            <label class="font-medium max-md:text-sm"
              >{{ $t("remaining_count") }}:</label
            >
            <input
              v-model.number="displayRemainingCount"
              type="number"
              class="w-32 p-2 border rounded max-md:w-full max-md:p-1.5 max-md:text-sm"
            />
          </div>
        </div>

        <!-- Modal Actions -->
        <div
          class="mt-6 flex justify-end gap-4 max-md:mt-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 rounded lg:hover:bg-gray-300 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="saveProbabilitySettings"
            class="px-4 py-2 bg-blue-500 text-white rounded lg:hover:bg-blue-700 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("save") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  userId: String,
});
const emit = defineEmits(["update:show", "updated"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  closeModal();
});
const isButtonLoading = ref(false);
const isPageLoading = ref(true);
const userLuckySpinSetting = ref(null);
const luckySpinPrizes = ref([]);
const currentProbabilities = ref([]);
const customLuckySpinProbabilities = ref([]);

const displayPrizes = computed(() => {
  if (isPageLoading.value) {
    return [];
  }
  if (userLuckySpinSetting.value?.settings?.length > 0) {
    return userLuckySpinSetting.value.settings;
  }
  return luckySpinPrizes.value;
});

const displayRemainingCount = computed({
  get() {
    return userLuckySpinSetting.value?.remainingCount || 0;
  },
  set(newValue) {
    if (userLuckySpinSetting.value) {
      userLuckySpinSetting.value.remainingCount = newValue;
    }
  },
});

const customProbabilities = computed({
  get() {
    if (userLuckySpinSetting.value?.remainingCount > 0) {
      if (currentProbabilities.value.length === 0) {
        currentProbabilities.value = userLuckySpinSetting.value.settings.map(
          (setting) => setting.probability
        );
      }
    } else {
      if (currentProbabilities.value.length === 0) {
        currentProbabilities.value = luckySpinPrizes.value.map(
          (prize) => prize.probability
        );
      }
    }
    return currentProbabilities.value;
  },
  set(newValue) {
    currentProbabilities.value = newValue;
  },
});

const fetchLuckySpinPrizes = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("getLuckySpin");
    if (data.success) {
      luckySpinPrizes.value = data.prizes;
    }
  } catch (error) {
    console.error("Failed to fetch lucky spin prizes:", error);
  }
};

const fetchUserLuckySpinSettings = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get(`getUserLuckySpinSetting/${props.userId}`);
    if (data.success) {
      userLuckySpinSetting.value = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
  }
};

const saveProbabilitySettings = async () => {
  isButtonLoading.value = true;
  try {
    const settings = displayPrizes.value.map((prize, index) => ({
      name: prize.name,
      angle: prize.angle,
      value: prize.value,
      probability: currentProbabilities.value[index],
    }));

    const { post } = useApiEndpoint();
    const { data } = await post(`setUserLuckySpinSetting/${props.userId}`, {
      settings,
      remainingCount: displayRemainingCount.value,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      await fetchUserLuckySpinSettings();
      emit("updated");
      closeModal();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating lucky spin settings:", error);
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

const closeModal = () => {
  currentProbabilities.value = [];
  emit("update:show", false);
};

onMounted(async () => {
  try {
    await Promise.all([fetchLuckySpinPrizes(), fetchUserLuckySpinSettings()]);
  } finally {
    isPageLoading.value = false;
  }
});
</script>
