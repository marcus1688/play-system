<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("promo_code_management") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Promo Codes Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_code')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="code in paginatedPromoCodes"
              :key="code._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ code.code }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ code.amount }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ code.claimedCount }}/{{ code.claimLimit }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="code.isActive"
                    @update:modelValue="() => handleStatusChange(code)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ code.isActive ? $t("active") : $t("inactive") }}
                  </span>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(code.createdAt) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <button
                  @click="handleEdit(code)"
                  class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                >
                  {{ $t("edit") }}
                </button>
              </td>
            </tr>
            <tr
              v-if="paginatedPromoCodes.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="6"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_promo_codes_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedPromoCodes.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- PromoCode Modal -->
    <PromoCodeModal
      v-model:show="showPromoCodeModal"
      :initial-data="editingCode"
      @success="fetchPromoCodes"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const isPageLoading = ref(true);
const { get, post, put, patch } = useApiEndpoint();
const tableHeaders = [
  { key: "code", label: "Code", labelCN: "代码" },
  { key: "amount", label: "Amount", labelCN: "金额" },
  { key: "claimLimit", label: "Claimed/Limit", labelCN: "已领取/限制" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "createdAt", label: "Created At", labelCN: "创建时间" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const editingCode = ref(null);
const promoCodes = ref([]);
const showPromoCodeModal = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredPromoCodes = computed(() => {
  let filtered = [...promoCodes.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((code) =>
      code.code.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredPromoCodes.value.length / itemsPerPage.value)
);

const paginatedPromoCodes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPromoCodes.value.slice(start, end).map((promocode, index) => ({
    ...promocode,
  }));
});

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchPromoCodes = async () => {
  try {
    const { data } = await get("promocodesadmin");
    if (data.success) {
      promoCodes.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load promo codes",
    });
  }
};

const handleCreate = () => {
  editingCode.value = null;
  showPromoCodeModal.value = true;
};

const handleEdit = (code) => {
  editingCode.value = code;
  showPromoCodeModal.value = true;
};

const handleStatusChange = async (code) => {
  try {
    const { data } = await patch(`promocodes/${code._id}/toggle`);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchPromoCodes();
    } else {
      code.isActive = !code.isActive;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    code.isActive = !code.isActive;
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchPromoCodes();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Promo Code",
});
</script>
