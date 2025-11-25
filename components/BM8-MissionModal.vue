<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[600px] max-w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6 border-b max-md:p-4 sticky top-0 bg-white z-10">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-base">
              {{ initialData?._id ? $t("edit") : $t("create") }}
              {{ $t("mission") }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("mission_type") }} <span class="text-red-500">*</span>
              </label>
              <CustomSelect
                v-model="formData.missionType"
                required
                :disabled="!!initialData?._id"
              >
                <option value="totalTurnover">
                  {{ $i18n.locale === "zh" ? "总流水" : "Total Turnover" }}
                </option>
                <option value="withdrawCount">
                  {{ $i18n.locale === "zh" ? "提款次数" : "Withdraw Count" }}
                </option>
                <option value="depositCount">
                  {{ $i18n.locale === "zh" ? "存款次数" : "Deposit Count" }}
                </option>
              </CustomSelect>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("target_value") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="formData.targetValue"
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("reward_points") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="formData.rewardPoints"
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("title") }} (English) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("title") }} (中文) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.titleCN"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("title") }} (Malay) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.titleMS"
                type="text"
                required
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("description") }} (English)
              </label>
              <textarea
                v-model="formData.description"
                rows="2"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("description") }} (中文)
              </label>
              <textarea
                v-model="formData.descriptionCN"
                rows="2"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("description") }} (Malay)
              </label>
              <textarea
                v-model="formData.descriptionMS"
                rows="2"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              ></textarea>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("sort_order") }}
              </label>
              <input
                v-model.number="formData.sortOrder"
                type="number"
                min="0"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
              />
            </div>
          </form>
        </div>

        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse sticky bottom-0 bg-white"
        >
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isLoading"
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ initialData?._id ? $t("save_changes") : $t("create") }}
          </LoadingButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { post, put } = useApiEndpoint();
const isLoading = ref(false);

const formData = ref({
  missionType: "totalTurnover",
  targetValue: "",
  rewardPoints: "",
  title: "",
  titleCN: "",
  titleMS: "",
  description: "",
  descriptionCN: "",
  descriptionMS: "",
  sortOrder: 0,
});

const resetForm = () => {
  formData.value = {
    missionType: "totalTurnover",
    targetValue: "",
    rewardPoints: "",
    title: "",
    titleCN: "",
    titleMS: "",
    description: "",
    descriptionCN: "",
    descriptionMS: "",
    sortOrder: 0,
  };
};

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const { data } = props.initialData?._id
      ? await put(`missions/${props.initialData._id}`, formData.value)
      : await post("missions", formData.value);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("success");
      emit("update:show", false);
      resetForm();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newValue) => {
    if (!newValue && !props.initialData) {
      resetForm();
    }
  }
);

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = {
        missionType: newData.missionType || "totalTurnover",
        targetValue: newData.targetValue || "",
        rewardPoints: newData.rewardPoints || "",
        title: newData.title || "",
        titleCN: newData.titleCN || "",
        titleMS: newData.titleMS || "",
        description: newData.description || "",
        descriptionCN: newData.descriptionCN || "",
        descriptionMS: newData.descriptionMS || "",
        sortOrder: newData.sortOrder || 0,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);
</script>
