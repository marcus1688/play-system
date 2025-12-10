<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col"
      >
        <div class="p-6 border-b flex-shrink-0 max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
              <h3 class="text-lg font-semibold max-md:text-base">
                {{ $t("new_deposit_breakdown") }}
              </h3>
            </div>
          </div>
          <div class="mt-4 relative">
            <Icon
              icon="material-symbols:search"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 max-md:left-2.5 max-md:w-4 max-md:h-4"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('search_username_fullname')"
              class="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:pl-8 max-md:pr-2 max-md:py-1.5 max-md:text-sm"
            />
          </div>
        </div>

        <div class="overflow-auto flex-grow">
          <div
            v-if="filteredData.length === 0"
            class="py-8 text-center text-gray-500 max-md:py-6"
          >
            <p class="max-md:text-sm">{{ $t("no_data") }}</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-center">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    v-if="hasUserid"
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                  >
                    {{ $t("user_id") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                  >
                    {{ $t("username") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                  >
                    {{ $t("fullname") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                  >
                    {{ $t("amount") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                  >
                    {{ $t("referral_by") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap max-md:px-3 max-md:py-2"
                  >
                    {{ $t("date") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="(item, index) in filteredData"
                  :key="index"
                  class="lg:hover:bg-gray-50"
                >
                  <td
                    v-if="hasUserid"
                    class="px-4 py-4 text-sm text-gray-900 whitespace-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ item.userid || "-" }}
                  </td>
                  <td
                    class="px-4 py-4 text-sm text-gray-900 whitespace-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ item.username }}
                  </td>
                  <td
                    class="px-4 py-4 text-sm text-gray-900 whitespace-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ item.fullname }}
                  </td>
                  <td
                    class="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ currency }} {{ formatAmount(item.amount) }}
                  </td>
                  <td
                    class="px-4 py-4 text-sm text-gray-900 whitespace-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ item.referralByFullname }}
                  </td>
                  <td
                    class="px-4 py-4 text-sm text-gray-600 text-center whitespace-nowrap max-md:px-3 max-md:py-3 max-md:text-xs"
                  >
                    {{ formatDate(item.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          class="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0 max-md:px-4 max-md:py-3"
        >
          <button
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
import { Icon } from "@iconify/vue";
import { formatAmount } from "~/utils/amountFormatter";
import { formatDate } from "~/utils/dateFormatter";

const props = defineProps({
  show: Boolean,
  data: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:show"]);
const currency = useCurrency();

const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});

const searchQuery = ref("");

const hasUserid = computed(() => {
  return props.data.some((item) => item.userid);
});

const filteredData = computed(() => {
  if (!searchQuery.value) {
    return props.data;
  }
  const searchTerm = searchQuery.value.toLowerCase();
  return props.data.filter(
    (item) =>
      item.username.toLowerCase().includes(searchTerm) ||
      item.fullname.toLowerCase().includes(searchTerm) ||
      (item.userid && item.userid.toLowerCase().includes(searchTerm)) ||
      (item.referralByFullname &&
        item.referralByFullname.toLowerCase().includes(searchTerm))
  );
});

watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      searchQuery.value = "";
    }
  }
);
</script>
