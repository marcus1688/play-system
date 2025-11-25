<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto max-w-full max-md:p-4"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              External Withdrawal
            </h2>
          </div>
          <button
            @click="$emit('update:show', false)"
            class="text-gray-500 lg:hover:text-gray-700"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <!-- Smart Contract List with Scroll -->
        <div
          class="border rounded-lg p-4 max-h-[200px] overflow-y-auto mb-4 max-md:p-3 max-md:mb-3"
        >
          <div
            v-if="!smartContracts || smartContracts.length === 0"
            class="text-center text-gray-500 max-md:text-sm"
          >
            No smart contracts available
          </div>
          <ul v-else class="list-none">
            <li
              v-for="(contract, index) in smartContracts"
              :key="index"
              class="mb-4 border-b pb-2 last:border-b-0 last:pb-0 max-md:mb-3 max-md:pb-1.5"
            >
              <div class="flex flex-col text-start">
                <div class="font-semibold underline max-md:text-sm">
                  Smart Contract
                </div>
                <div class="text-gray-600 max-md:text-xs break-all">
                  {{ contract.smartContractAddress }}
                </div>
              </div>
              <div class="flex gap-2 max-md:gap-1.5">
                <div class="font-semibold max-md:text-sm">Balance:</div>
                <div class="text-gray-600 max-md:text-sm">
                  USDT {{ Number(contract.amount).toFixed(2) }}
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4 max-md:space-y-3">
          <div class="hidden">
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >Private Key</label
            >
            <input
              type="text"
              v-model="formData.fromPrivateKey"
              disabled
              readonly
              class="w-full px-3 py-2 border rounded-lg bg-gray-50 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >Recipient Address</label
            >
            <input
              type="text"
              v-model="formData.to"
              placeholder="Enter recipient address"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >Amount</label
            >
            <input
              type="text"
              v-model="formData.amount"
              placeholder="Enter amount"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >Smart Address</label
            >
            <input
              type="text"
              v-model="formData.tokenAddress"
              placeholder="Enter smart contract address"
              required
              class="w-full px-3 py-2 border rounded-lg max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >TRX Fees Limit</label
            >
            <input
              type="number"
              v-model="formData.feeLimit"
              disabled
              readonly
              class="w-full px-3 py-2 border rounded-lg bg-gray-50 max-md:px-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>

          <!-- Submit Button -->
          <div
            class="flex justify-end gap-3 pt-4 max-md:pt-3 max-md:gap-2 max-md:flex-col-reverse"
          >
            <button
              type="button"
              @click="$emit('update:show', false)"
              class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              Cancel
            </button>
            <LoadingButton
              :loading="isLoading"
              type="submit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              Submit Withdrawal
            </LoadingButton>
          </div>
        </form>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: Boolean,
  privateKey: {
    type: String,
    default: "",
  },
  senderAccountId: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  smartContracts: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:show", "submit"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const formData = ref({
  fromPrivateKey: "",
  senderAccountId: "",
  address: "",
  to: "",
  amount: "",
  tokenAddress: "",
  feeLimit: 20,
});

watch(
  () => props.privateKey,
  (newVal) => {
    formData.value.fromPrivateKey = newVal;
  },
  { immediate: true }
);

watch(
  () => props.senderAccountId,
  (newVal) => {
    formData.value.senderAccountId = newVal;
  },
  { immediate: true }
);

watch(
  () => props.address,
  (newVal) => {
    formData.value.address = newVal;
  },
  { immediate: true }
);

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      formData.value.to = "";
      formData.value.amount = "";
      formData.value.tokenAddress = "";
    }
  }
);

const handleSubmit = () => {
  emit("submit", { ...formData.value });
};
</script>
