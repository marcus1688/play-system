<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[400px] max-w-full">
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{
                type === "deposit"
                  ? $t("adjust_total_deposit")
                  : $t("adjust_total_withdraw")
              }}
            </h2>
          </div>
        </div>

        <div class="p-4">
          <!-- Current Amount -->
          <div
            class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-md:p-3 max-md:mb-3"
          >
            <div class="text-sm text-gray-500 max-md:text-xs">
              {{ $t("current_amount") }}
            </div>
            <div class="font-semibold text-gray-800 text-lg max-md:text-base">
              {{ currency }} {{ formatAmount(currentAmount) }}
            </div>
          </div>

          <form
            @submit.prevent="handleSubmit"
            class="space-y-4 max-md:space-y-3"
          >
            <!-- Adjust Amount -->
            <div>
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("adjust_amount") }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.amount"
                type="number"
                step="0.01"
                :placeholder="$t('enter_amount')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                {{ $t("adjust_amount_hint") }}
              </p>
            </div>

            <!-- Preview New Amount -->
            <div
              v-if="formData.amount"
              class="bg-indigo-50 border border-indigo-200 rounded-lg p-3 max-md:p-2"
            >
              <div class="flex justify-between text-sm max-md:text-xs">
                <span class="text-gray-600">{{ $t("new_amount") }}:</span>
                <span class="font-bold text-indigo-600">
                  {{ currency }} {{ formatAmount(newAmount) }}
                </span>
              </div>
            </div>

            <!-- Remark -->
            <div class="hidden">
              <label
                class="block text-sm font-medium text-gray-700 mb-2 max-md:text-xs max-md:mb-1.5"
              >
                {{ $t("remark") }}
              </label>
              <input
                v-model="formData.remark"
                type="text"
                :placeholder="$t('remark')"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              />
            </div>
          </form>
        </div>

        <div
          class="p-6 border-t flex justify-end gap-3 max-md:p-4 max-md:gap-2 max-md:flex-col-reverse"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-100 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("cancel") }}
          </button>
          <button
            @click="handleSubmit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("confirm") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: "deposit",
  },
  currentAmount: {
    type: [Number, String],
    default: 0,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => closeModal());
const currency = useCurrency();

const formData = ref({
  amount: "",
  remark: "",
});

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const newAmount = computed(() => {
  const current = Number(props.currentAmount) || 0;
  const adjust = Number(formData.value.amount) || 0;
  return current + adjust;
});

const handleSubmit = async () => {
  if (!formData.value.amount) {
    await Swal.fire({
      icon: "warning",
      title: $t("warning"),
      text: $t("please_enter_valid_amount"),
    });
    return;
  }

  const result = await Swal.fire({
    title: $t("confirm_adjust"),
    html: `
      <div class="text-left">
        <p><strong>${$t("current_amount")}:</strong> ${
      currency.value
    } ${formatAmount(props.currentAmount)}</p>
        <p><strong>${$t("adjust_amount")}:</strong> ${
      currency.value
    } ${formatAmount(formData.value.amount)}</p>
        <p><strong>${$t("new_amount")}:</strong> ${
      currency.value
    } ${formatAmount(newAmount.value)}</p>
      </div>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#d33",
    confirmButtonText: $t("confirm"),
    cancelButtonText: $t("cancel"),
  });

  if (result.isConfirmed) {
    emit("submit", {
      amount: formData.value.amount,
      remark: formData.value.remark,
    });
  }
};

const closeModal = () => {
  formData.value = {
    amount: "",
    remark: "",
  };
  emit("update:show", false);
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      formData.value = {
        amount: "",
        remark: "",
      };
    }
  }
);
</script>
