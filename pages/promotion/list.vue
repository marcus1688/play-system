<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header & Create Button -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("promotion_list") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <BaseSearch
          v-model="searchQuery"
          :placeholder="$t('search_promotion')"
          @type-change="handleTypeChange"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="promotion in paginatedPromotions"
              :key="promotion._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promotion.maintitleEN }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-w-[250px] text-wrap max-md:px-3 max-md:py-3 max-md:text-xs max-md:max-w-[150px]"
              >
                {{ promotion.categories?.map((c) => c.name).join(", ") || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promotion.claimtype }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatAmount(promotion.mindeposit) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatAmount(promotion.maxbonus) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ promotion.order || 0 }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <img
                    v-if="promotion.promotionimage"
                    :src="promotion.promotionimage"
                    class="w-64 max-h-24 object-cover rounded max-md:w-40 max-md:max-h-16"
                  />
                  <p v-else class="max-md:text-xs">-</p>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex justify-center">
                  <BaseToggleSwitch
                    v-model="promotion.status"
                    @update:modelValue="() => toggleStatus(promotion)"
                  />
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="handleEdit(promotion)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[promotion._id]"
                    @click="handleDelete(promotion)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedPromotions.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                :colspan="tableHeaders.length"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_promotion_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedPromotions.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Promotion Modal -->
    <PromotionModal
      v-model:show="showModal"
      :initial-data="editingPromotion"
      @success="fetchPromotions"
    />
  </div>
</template>

<script setup>
import { formatAmount } from "~/utils/amountFormatter";

const isButtonLoading = ref({});
const isPageLoading = ref(true);
const { publicGet, patch, publicDelete: del } = useApiEndpoint();
const tableHeaders = [
  { key: "name", label: "Name", labelCN: "名称" },
  { key: "category", label: "Category", labelCN: "分类" },
  { key: "claimType", label: "Claim Type", labelCN: "领取类型" },
  { key: "minDeposit", label: "Min Deposit", labelCN: "最低存款" },
  { key: "maxBonus", label: "Max Bonus", labelCN: "最高奖金" },
  { key: "order", label: "Order", labelCN: "顺序" },
  { key: "image", label: "Image", labelCN: "图片" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const promotions = ref([]);
const showModal = ref(false);
const editingPromotion = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchPromotions = async () => {
  try {
    const { data } = await publicGet("promotions");
    if (data.success) {
      promotions.value = data.data;
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load promotions",
    });
  }
};

const toggleStatus = async (promotion) => {
  try {
    const { data } = await patch(`promotions/${promotion._id}/toggle`);
    if (data.success) {
      await fetchPromotions();
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
    } else {
      promotion.status = !promotion.status;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    promotion.status = !promotion.status;
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

const handleCreate = () => {
  editingPromotion.value = null;
  showModal.value = true;
};

const handleEdit = (promotion) => {
  editingPromotion.value = promotion;
  showModal.value = true;
};

const handleDelete = async (promotion) => {
  isButtonLoading.value[promotion._id] = true;
  try {
    const result = await Swal.fire({
      title: $t("delete_confirmation"),
      text: $t("delete_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });

    if (result.isConfirmed) {
      const { data } = await del(`promotions/${promotion._id}`);
      if (data.success) {
        await fetchPromotions();
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value[promotion._id] = false;
  }
};

const filteredPromotions = computed(() => {
  let result = [...promotions.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.maintitle.toLowerCase().includes(query) ||
        p.maintitleEN.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.descriptionEN.toLowerCase().includes(query)
    );
  }
  return result;
});

const paginatedPromotions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPromotions.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredPromotions.value.length / itemsPerPage.value)
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchPromotions();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Promotion",
});
</script>
