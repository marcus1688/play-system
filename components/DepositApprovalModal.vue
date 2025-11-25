<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <PageLoading v-if="isPageLoading" />
      <div class="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div class="flex items-center justify-between p-4 border-b max-md:p-3">
          <h3 class="text-lg font-medium max-md:text-base">
            {{ $t("deposit_approval") }}
          </h3>
        </div>
        <div class="p-6 max-md:p-4">
          <div
            class="mb-4 border p-3 rounded bg-gray-50 max-md:mb-3 max-md:p-2"
          >
            <p class="text-sm font-medium text-gray-700 max-md:text-xs">
              {{ $t("username") }}: {{ depositData.username }}
            </p>
            <p
              class="text-sm font-medium text-gray-700 mt-1 max-md:text-xs max-md:mt-0.5"
            >
              {{ $t("fullname") }}: {{ depositData.fullname }}
            </p>
            <p
              class="text-sm font-medium text-gray-700 mt-1 max-md:text-xs max-md:mt-0.5"
            >
              {{ $t("deposit_amount") }}: {{ currency }} {{ depositAmount }}
            </p>
          </div>

          <div class="mb-4 max-md:mb-3">
            <label
              class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
            >
              {{ $t("deposit_name") }} ({{ $t("optional") }})
            </label>
            <div class="flex flex-col">
              <input
                v-model="depositName"
                type="text"
                class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
                :placeholder="$t('enter_deposit_name')"
                maxlength="100"
              />
              <p
                class="text-xs text-gray-500 mt-1 max-md:text-[10px] max-md:mt-0.5"
              >
                {{ $t("deposit_name_explanation") }}
              </p>
            </div>
          </div>

          <div
            v-if="validationError"
            class="text-red-500 text-sm mb-4 max-md:text-xs max-md:mb-3"
          >
            {{ validationError }}
          </div>
        </div>
        <div
          class="flex justify-end gap-2 px-6 py-4 bg-gray-50 rounded-b-lg max-md:px-4 max-md:py-3 max-md:flex-col-reverse max-md:gap-1.5"
        >
          <button
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <LoadingButton
            :loading="isButtonLoading"
            @click="handleConfirm"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md lg:hover:bg-indigo-700 disabled:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            {{ $t("confirm") }}
          </LoadingButton>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
const currency = useCurrency();

const props = defineProps({
  modelValue: Boolean,
  depositId: String,
  depositAmount: {
    type: Number,
    required: true,
  },
  depositData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:modelValue", false);
});

const isButtonLoading = ref(false);
const isPageLoading = ref(false);
const depositName = ref("");
const validationError = ref("");

const handleConfirm = async () => {
  isButtonLoading.value = true;
  validationError.value = "";
  try {
    if (depositName.value && depositName.value.length > 100) {
      validationError.value = $t("deposit_name_too_long");
      isButtonLoading.value = false;
      return;
    }
    emit("confirm", {
      depositId: props.depositId,
      depositname: depositName.value.trim() || null,
    });
    emit("update:modelValue", false);
    depositName.value = "";
  } catch (error) {
    console.error("Error in confirmation:", error);
    validationError.value = $t("general_error");
  } finally {
    isButtonLoading.value = false;
  }
};

const isValidSubmit = computed(() => {
  return !isButtonLoading.value;
});

const handleKeydown = (event) => {
  const activeElement = document.activeElement;
  const isInputFocused =
    activeElement &&
    (activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.contentEditable === "true");
  if (
    event.code === "Space" &&
    props.modelValue &&
    isValidSubmit.value &&
    !isButtonLoading.value &&
    !isInputFocused
  ) {
    event.preventDefault();
    handleConfirm();
  }
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      depositName.value = "";
      validationError.value = "";
    }
  }
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
