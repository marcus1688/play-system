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
              {{ $t("transfer_out") }}
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
              :max="balance"
            />
            <p class="text-sm text-gray-500 mt-1 max-md:text-xs max-md:mt-0.5">
              {{ $t("available_balance") }}: {{ formatAmount(balance) }}
              {{ $t("points") }}
              <span
                v-if="transferMultiplier > 1"
                class="text-indigo-600 font-medium"
              >
                (x{{ transferMultiplier }})
              </span>
            </p>
            <p
              v-if="transferMultiplier > 1 && formData.amount"
              class="text-sm text-green-600 mt-1 max-md:text-xs max-md:mt-0.5"
            >
              {{ $t("actual_cashout") }}: {{ currency }}
              {{ formatAmount(actualCashoutAmount) }}
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
    </div></Teleport
  >
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

const { post, patch } = useApiEndpoint();
const currency = useCurrency();
const isButtonLoading = ref(false);

const formData = ref({
  amount: "",
  remark: "",
});

const transferMultiplier = computed(() => {
  if (!props.game) return 1;
  const kioskName = props.game.name?.toLowerCase() || "";
  if (kioskName.includes("x5")) return 5;
  if (kioskName.includes("x2")) return 2;
  return 1;
});

const actualCashoutAmount = computed(() => {
  return Number(formData.value.amount || 0) * transferMultiplier.value;
});

const handleSubmit = async () => {
  if (Number(formData.value.amount) > props.balance) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("amount_exceeds_balance"),
    });
    return;
  }

  if (!formData.value.amount || formData.value.amount <= 0) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_enter_valid_amount"),
    });
    return;
  }

  if (!formData.value.remark || !formData.value.remark.trim()) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_enter_remark"),
    });
    return;
  }

  try {
    const result = await Swal.fire({
      title: $t("confirm_transfer_out"),
      html: `
    <div class="text-left">
      <p><strong>${$t("game")}:</strong> ${props.game?.name}</p>
      <p><strong>${$t("transfer_out_amount")}:</strong> ${
        currency.value
      } ${formatAmount(formData.value.amount)}</p>
      ${
        transferMultiplier.value > 1
          ? `<p><strong>${$t("actual_cashout")}:</strong> ${
              currency.value
            } ${formatAmount(actualCashoutAmount.value)} (x${
              transferMultiplier.value
            })</p>`
          : ""
      }
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

    // Step 1: Call Kiosk Transfer Out API
    const transferEndpoint = `${props.game.transferOutAPI}/${props.userId}`;
    const transferResponse = await post(transferEndpoint, {
      transferAmount: Number(formData.value.amount),
      remark: formData.value.remark || "",
    });

    if (!transferResponse.data.success) {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          transferResponse.data.message?.[$locale.value] ||
          transferResponse.data.message?.en ||
          $t("transfer_failed"),
      });
      isButtonLoading.value = false;
      return;
    }

    // Step 2: Record CashOut
    const cashoutResponse = await patch(`user/cashout/${props.userId}`, {
      amount: Number(actualCashoutAmount.value),
      remark: formData.value.remark,
      kioskName: props.game?.name,
    });

    if (cashoutResponse.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: $t("transfer_out_success"),
        timer: 1500,
      });
      emit("success");
      closeModal();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          cashoutResponse.data.message?.[$locale.value] ||
          cashoutResponse.data.message?.en ||
          $t("cashout_failed"),
      });
    }
  } catch (error) {
    console.error("Error processing transfer out:", error);
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

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      formData.value = { amount: "", remark: "" };
    }
  }
);
</script>
