<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[500px] p-6 max-w-full max-md:p-4">
        <div class="flex items-center justify-between mb-6 max-md:mb-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("transfer_in") }}
            </h2>
          </div>
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("game") }}
            </label>
            <div
              class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            >
              {{ game?.name || "-" }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("amount") }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.amount"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
            <p class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5">
              {{ $t("game_balance") }}: {{ formatAmount(balance) }}
              {{ $t("points") }}
            </p>
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >
              {{ $t("remark") }}
            </label>
            <input
              v-model="formData.remark"
              type="text"
              :placeholder="$t('remark')"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div
            class="flex justify-end gap-3 pt-4 max-md:pt-3 max-md:gap-2 max-md:flex-col-reverse"
          >
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("cancel") }}
            </button>
            <LoadingButton
              :loading="isButtonLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              {{ $t("confirm_transfer") }}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { formatAmount } from "~/utils/amountFormatter";

const props = defineProps({
  show: Boolean,
  balance: {
    type: Number,
    required: true,
  },
  game: {
    type: Object,
    default: null,
  },
  userId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:show", "success"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});

const { post } = useApiEndpoint();
const currency = useCurrency();
const isButtonLoading = ref(false);

const formData = ref({
  amount: "",
  remark: "",
});

const handleSubmit = async () => {
  if (!formData.value.amount || formData.value.amount <= 0) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_enter_valid_amount"),
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: $t("confirm_transfer_in"),
      html: `
        <div class="text-left">
          <p><strong>${$t("game")}:</strong> ${props.game?.name}</p>
          <p><strong>${$t("transfer_in_amount")}:</strong> ${
        currency.value
      } ${formatAmount(formData.value.amount)}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!result.isConfirmed) return;

    isButtonLoading.value = true;

    const transferEndpoint = `${props.game.transferInAPI}/${props.userId}`;
    const transferResponse = await post(transferEndpoint, {
      transferAmount: Number(formData.value.amount),
    });

    if (transferResponse.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: $t("transfer_in_success"),
        timer: 1500,
      });
      emit("success");
      closeModal();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          transferResponse.data.message?.[$locale.value] ||
          transferResponse.data.message?.en ||
          $t("transfer_failed"),
      });
    }
  } catch (error) {
    console.error("Error processing transfer in:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("transfer_failed"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

const closeModal = () => {
  formData.value = { amount: "", remark: "" };
  emit("update:show", false);
};
</script>
