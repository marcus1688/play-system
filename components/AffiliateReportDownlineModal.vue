<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 max-md:p-2"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white overflow-y-auto max-h-[85vh] rounded-lg shadow-lg p-0 max-w-6xl w-full mx-4 overflow-hidden flex flex-col max-md:mx-2 max-md:max-h-[90vh]"
      >
        <!-- Header -->
        <div class="flex justify-between items-center p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800 max-md:text-base">
                {{ $t("downline_details") }}
              </h3>
              <p
                class="text-sm text-gray-600 mt-1 max-md:text-xs max-md:mt-0.5"
              >
                {{ $t("total_downlines") }}: {{ actualDetails.length }}
              </p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 lg:hover:text-gray-600 transition-colors"
          >
            <Icon
              icon="material-symbols:close"
              class="w-6 h-6 max-md:w-5 max-md:h-5"
            />
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="p-6 border-b bg-gray-50 max-md:p-4">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 max-md:gap-3">
            <!-- Total Deposits -->
            <div class="bg-white rounded-lg p-4 shadow max-md:p-3">
              <p
                class="text-xs font-medium text-gray-500 uppercase mb-2 max-md:text-[10px] max-md:mb-1"
              >
                {{ $t("total_deposits") }}
              </p>
              <p class="text-xl font-semibold text-gray-800 max-md:text-base">
                {{ currency }} {{ formatAmount(totalDeposits) }}
              </p>
            </div>

            <!-- Total Withdrawals -->
            <div class="bg-white rounded-lg p-4 shadow max-md:p-3">
              <p
                class="text-xs font-medium text-gray-500 uppercase mb-2 max-md:text-[10px] max-md:mb-1"
              >
                {{ $t("total_withdrawals") }}
              </p>
              <p class="text-xl font-semibold text-gray-800 max-md:text-base">
                {{ currency }} {{ formatAmount(totalWithdrawals) }}
              </p>
            </div>

            <!-- Total Bonuses -->
            <div class="bg-white rounded-lg p-4 shadow max-md:p-3">
              <p
                class="text-xs font-medium text-gray-500 uppercase mb-2 max-md:text-[10px] max-md:mb-1"
              >
                {{ $t("total_bonus") }}
              </p>
              <p class="text-xl font-semibold text-gray-800 max-md:text-base">
                {{ currency }} {{ formatAmount(totalBonuses) }}
              </p>
            </div>

            <!-- Total API Fees -->
            <div class="bg-white rounded-lg p-4 shadow max-md:p-3">
              <p
                class="text-xs font-medium text-gray-500 uppercase mb-2 max-md:text-[10px] max-md:mb-1"
              >
                {{ $t("api_fees") }}
              </p>
              <p class="text-xl font-semibold text-gray-800 max-md:text-base">
                {{ currency }} {{ formatAmount(totalAPIFees) }}
              </p>
            </div>

            <!-- Net Amount -->
            <div
              class="bg-white rounded-lg p-4 shadow max-md:p-3 max-md:col-span-2 md:col-span-1"
            >
              <p
                class="text-xs font-medium text-gray-500 uppercase mb-2 max-md:text-[10px] max-md:mb-1"
              >
                {{ $t("net_amount") }}
              </p>
              <p
                class="text-xl font-semibold max-md:text-base"
                :class="totalNetAmount >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ currency }} {{ formatAmount(totalNetAmount) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Table Container -->
        <div class="flex-1 overflow-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("username") }}
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("wallet") }}
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("deposit") }}
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("withdraw") }}
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("bonus") }}
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("api_fee") }}
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                >
                  {{ $t("net_amount") }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(detail, index) in actualDetails"
                :key="detail.userId || detail.username || index"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ detail.username || "-" }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ currency }} {{ formatAmount(detail.currentWalletBalance) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ currency }} {{ formatAmount(detail.totalDeposit) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ currency }} {{ formatAmount(detail.totalWithdraw) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ currency }} {{ formatAmount(detail.totalBonus) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  {{ currency }} {{ formatAmount(detail.totalAPIFees) || "-" }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm text-right max-md:px-3 max-md:py-3 max-md:text-xs"
                >
                  <div class="flex flex-col items-end">
                    <span
                      :class="[
                        'font-semibold',
                        detail.netAmount >= 0
                          ? 'text-green-600'
                          : 'text-red-600',
                      ]"
                    >
                      {{ currency }} {{ formatAmount(detail.netAmount) }}
                    </span>
                    <span
                      :class="[
                        'text-xs max-md:text-[10px]',
                        detail.netAmount >= 0
                          ? 'text-green-500'
                          : 'text-red-500',
                      ]"
                    >
                      {{ detail.netAmount >= 0 ? $t("profit") : $t("loss") }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div
          v-if="actualDetails.length === 0"
          class="flex-1 flex items-center justify-center py-12 max-md:py-8"
        >
          <div class="text-center">
            <img
              src="/images/empty2.png"
              alt="Empty State"
              class="w-32 h-auto opacity-80 mx-auto mb-4 max-md:w-24 max-md:mb-3"
            />
            <p class="text-gray-500 max-md:text-sm">
              {{ $t("no_downline_data") }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-6 py-4 border-t bg-gray-50 flex justify-end max-md:px-4 max-md:py-3"
        >
          <button
            @click="closeModal"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg lg:hover:bg-gray-700 transition-colors max-md:w-full max-md:px-4 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";
const currency = useCurrency();

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  details: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  closeModal();
});

// Computed properties
const actualDetails = computed(() => {
  return props.details;
});

const totalDeposits = computed(() => {
  return actualDetails.value.reduce(
    (sum, detail) => sum + (detail.totalDeposit || 0),
    0
  );
});

const totalWithdrawals = computed(() => {
  return actualDetails.value.reduce(
    (sum, detail) => sum + (detail.totalWithdraw || 0),
    0
  );
});

const totalBonuses = computed(() => {
  return actualDetails.value.reduce(
    (sum, detail) => sum + (detail.totalBonus || 0),
    0
  );
});

const totalAPIFees = computed(() => {
  return actualDetails.value.reduce(
    (sum, detail) => sum + (detail.totalAPIFees || 0),
    0
  );
});

const totalNetAmount = computed(() => {
  return actualDetails.value.reduce(
    (sum, detail) => sum + (detail.netAmount || 0),
    0
  );
});

const closeModal = () => {
  emit("close");
};
</script>
