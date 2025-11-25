<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center custom-modal z-[999] p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto max-md:w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("downlines") }}
            </h2>
          </div>
        </div>

        <div>
          <div v-if="isLoading">
            <div class="flex justify-center items-center h-48 max-md:h-36">
              <LoadingSpinner />
            </div>
          </div>
          <div v-else>
            <div
              class="p-4 flex items-center justify-between max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-start"
            >
              <div class="text-gray-600 max-md:text-sm">
                {{ $t("total") }}: {{ downlines.length }} {{ $t("downline") }}
              </div>
              <BaseSearch v-model="searchQuery" />
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center max-md:px-3 max-md:py-2"
                    >
                      {{ $t("username") }}
                    </th>
                    <th
                      class="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center max-md:px-3 max-md:py-2"
                    >
                      {{ $t("total_deposit") }}
                    </th>
                    <th
                      class="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center max-md:px-3 max-md:py-2"
                    >
                      {{ $t("total_withdraw") }}
                    </th>
                    <th
                      class="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center max-md:px-3 max-md:py-2"
                    >
                      {{ $t("net_winloss") }}
                    </th>
                    <th
                      class="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center max-md:px-3 max-md:py-2"
                    >
                      {{ $t("last_deposit_date") }}
                    </th>
                    <th
                      class="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-center max-md:px-3 max-md:py-2"
                    >
                      {{ $t("last_login") }}
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    v-for="downline in paginatedDownlines"
                    :key="downline._id"
                    class="lg:hover:bg-gray-50"
                  >
                    <td
                      class="px-6 py-4 text-sm text-center max-md:px-3 max-md:py-3 max-md:text-xs"
                    >
                      {{ downline.username }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-center max-md:px-3 max-md:py-3 max-md:text-xs"
                    >
                      {{ currency }}
                      {{ downline.totaldeposit?.toFixed(2) || "0.00" }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-center max-md:px-3 max-md:py-3 max-md:text-xs"
                    >
                      {{ currency }}
                      {{ downline.totalwithdraw?.toFixed(2) || "0.00" }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-center max-md:px-3 max-md:py-3 max-md:text-xs"
                    >
                      {{ currency }}
                      {{
                        (
                          (downline.totaldeposit || 0) -
                          (downline.totalwithdraw || 0)
                        ).toFixed(2)
                      }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-center max-md:px-3 max-md:py-3 max-md:text-xs"
                    >
                      {{ formatDate(downline.lastdepositdate) }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-center max-md:px-3 max-md:py-3 max-md:text-xs"
                    >
                      {{ formatDate(downline.lastLogin) }}
                    </td>
                  </tr>
                  <tr
                    v-if="paginatedDownlines.length === 0"
                    class="h-[300px] max-md:h-[250px]"
                  >
                    <td
                      colspan="6"
                      class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
                    >
                      <div
                        class="flex flex-col gap-8 items-center max-md:gap-4"
                      >
                        <img
                          src="/images/empty2.png"
                          alt="Empty State"
                          class="w-32 h-auto opacity-80 max-md:w-24"
                        />
                        {{ $t("no_downlines_found") }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <BasePagination
                v-if="filteredDownlines.length > 0"
                v-model="currentPage"
                :totalPages="totalPages"
              />
            </div>
          </div>
        </div>

        <div class="p-6 border-t flex justify-end gap-3 max-md:p-4">
          <button
            type="button"
            @click="$emit('update:show', false)"
            class="px-4 py-2 border rounded-lg lg:hover:bg-gray-50 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  downlines: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const currency = useCurrency();
const currentPage = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const filteredDownlines = computed(() => {
  if (!searchQuery.value) return props.downlines;

  const searchTerm = searchQuery.value.toLowerCase();
  return props.downlines.filter((downline) =>
    downline.username.toLowerCase().includes(searchTerm)
  );
});

const paginatedDownlines = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredDownlines.value.slice(startIndex, endIndex);
});

const totalPages = computed(() =>
  Math.ceil(filteredDownlines.value.length / itemsPerPage.value)
);

watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      currentPage.value = 1;
      searchQuery.value = "";
    }
  }
);
</script>
```
