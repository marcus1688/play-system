<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto max-w-full max-md:p-4"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-4 max-md:mb-3">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-base">
              USDT Transaction Details
            </h2>
          </div>
          <button
            @click="$emit('update:show', false)"
            class="text-gray-500 lg:hover:text-gray-700 flex-shrink-0"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <!-- Transaction List -->
        <div
          v-if="!transactions || transactions.length === 0"
          class="text-center text-gray-500 py-8 max-md:py-6 max-md:text-sm"
        >
          No transactions available
        </div>
        <ul v-else class="space-y-4 max-md:space-y-3">
          <li
            v-for="(transaction, index) in transactions"
            :key="index"
            :class="{
              'bg-red-100':
                transaction.fromAddress === accountAddress &&
                transaction.toAddress !== accountAddress,
              'bg-green-100':
                transaction.fromAddress !== accountAddress &&
                transaction.toAddress === accountAddress,
              'bg-yellow-100':
                transaction.fromAddress === accountAddress &&
                transaction.toAddress === accountAddress,
            }"
            class="border p-4 rounded-lg shadow-sm max-md:p-3"
          >
            <div class="font-semibold text-gray-700 mb-2 max-md:mb-1.5">
              <p class="font-bold max-md:text-sm">Transaction ID:</p>
              <span class="text-gray-900 break-all max-md:text-xs">{{
                transaction.transactionId
              }}</span>
            </div>
            <div class="font-semibold text-gray-700 mb-2 max-md:mb-1.5">
              <p class="font-bold max-md:text-sm">Time:</p>
              <span class="text-gray-900 max-md:text-xs">{{
                transaction.time
              }}</span>
            </div>
            <div class="font-semibold text-gray-700 mb-2 max-md:mb-1.5">
              <p class="font-bold max-md:text-sm">From:</p>
              <span class="text-gray-900 max-md:text-xs break-all">{{
                transaction.fromAddress
              }}</span>
            </div>
            <div class="font-semibold text-gray-700 mb-2 max-md:mb-1.5">
              <p class="font-bold max-md:text-sm">To:</p>
              <span class="text-gray-900 max-md:text-xs break-all">{{
                transaction.toAddress
              }}</span>
            </div>
            <div class="font-semibold text-gray-700 mb-2 max-md:mb-1.5">
              <p class="font-bold max-md:text-sm">Symbol:</p>
              <span class="text-gray-900 max-md:text-xs">{{
                transaction.symbol
              }}</span>
            </div>
            <div class="font-semibold text-gray-700 max-md:mb-0">
              <p class="font-bold max-md:text-sm">Amount:</p>
              <span class="text-gray-900 max-md:text-xs">{{
                transaction.amount
              }}</span>
            </div>
          </li>
        </ul>

        <!-- Close Button -->
        <div class="flex justify-end mt-6 max-md:mt-4">
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: Boolean,
  transactions: {
    type: Array,
    default: () => [],
  },
  accountAddress: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
</script>
