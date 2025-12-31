<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{
                type === "deposit"
                  ? $t("cross_day_reverts_deposit")
                  : $t("cross_day_reverts_withdraw")
              }}
            </h2>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <p class="text-sm text-gray-500 mb-4 max-md:text-xs max-md:mb-3">
            {{
              type === "deposit"
                ? $t("cross_day_reverts_deposit_note")
                : $t("cross_day_reverts_withdraw_note")
            }}
          </p>

          <div class="overflow-x-auto">
            <table class="w-full text-sm text-nowrap">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("transaction_id") }}
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("username") }}
                  </th>
                  <th
                    class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("amount") }}
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("created_at") }}
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
                  >
                    {{ $t("reverted_at") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="item in data?.items"
                  :key="item.transactionId"
                  class="lg:hover:bg-gray-50"
                >
                  <td
                    class="px-4 py-3 text-sm text-gray-600 max-md:px-3 max-md:py-2 max-md:text-xs"
                  >
                    {{ item.transactionId }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-600 max-md:px-3 max-md:py-2 max-md:text-xs"
                  >
                    {{ item.username }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-600 text-right max-md:px-3 max-md:py-2 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(item.amount) }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-600 max-md:px-3 max-md:py-2 max-md:text-xs"
                  >
                    {{ formatDate(item.createdAt) }}
                  </td>
                  <td
                    class="px-4 py-3 text-sm text-gray-600 max-md:px-3 max-md:py-2 max-md:text-xs"
                  >
                    {{ formatDate(item.revertedAt) }}
                  </td>
                </tr>
                <tr v-if="!data?.items?.length">
                  <td
                    colspan="5"
                    class="px-4 py-8 text-center text-gray-500 max-md:px-3 max-md:py-6 max-md:text-sm"
                  >
                    {{ $t("no_records_found") }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 p-4 rounded-lg bg-indigo-50 max-md:mt-3 max-md:p-3">
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-700 max-md:text-sm">
                {{ $t("total") }} ({{ data?.count || 0 }} {{ $t("records") }})
              </span>
              <span
                class="font-semibold text-lg text-indigo-600 max-md:text-base"
              >
                {{ currency }} {{ formatAmount(data?.total || 0) }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-6 border-t flex justify-end max-md:p-4">
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import { formatAmount } from "~/utils/amountFormatter";

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    default: "deposit",
  },
  data: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const currency = useCurrency();
</script>
