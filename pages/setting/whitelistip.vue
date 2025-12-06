<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("whitelist_ip") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search_ips_or_description')"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("ip_addresses") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("description") }}
              </th>

              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("last_updated") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="item in paginatedWhitelistIPs"
              :key="item._id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="text-sm text-gray-900 max-h-24 overflow-y-auto custom-scrollbar max-md:text-xs max-md:max-h-20"
                >
                  <div v-for="ip in item.ips" :key="ip" class="mb-1">
                    {{ ip }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span class="text-sm text-gray-900 max-md:text-xs">{{
                  item.description || "-"
                }}</span>
              </td>

              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span class="text-sm text-gray-500 max-md:text-xs">
                  {{ formatDate(item.updatedAt) }}
                </span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex justify-center items-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="handleEdit(item)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[item._id]"
                    @click="handleDelete(item)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedWhitelistIPs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="5"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_whitelisted_ips_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedWhitelistIPs.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <WhitelistIPModal
      v-model:show="showModal"
      :initial-data="editingIP"
      @success="fetchWhitelistIPs"
    />
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
const router = useRouter();
const { get, post, put, delete: del } = useApiEndpoint();
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const whitelistIPs = ref([]);
const showModal = ref(false);
const editingIP = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredWhitelistIPs = computed(() => {
  let filtered = whitelistIPs.value;
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) => {
      const hasMatchingIP = item.ips.some((ip) =>
        ip.toLowerCase().includes(term)
      );
      const hasMatchingDescription =
        item.description && item.description.toLowerCase().includes(term);

      return hasMatchingIP || hasMatchingDescription;
    });
  }
  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredWhitelistIPs.value.length / itemsPerPage.value) || 1;
});

const paginatedWhitelistIPs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredWhitelistIPs.value.slice(start, end);
});

const fetchWhitelistIPs = async () => {
  try {
    isPageLoading.value = true;
    const { data } = await get("whitelist-ips");
    if (data.success) {
      whitelistIPs.value = data.whitelistedIPs;
    }
  } catch (error) {
    console.error("Error fetching whitelist IPs:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load whitelist IP addresses",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const handleCreate = () => {
  editingIP.value = null;
  showModal.value = true;
};

const handleEdit = (item) => {
  editingIP.value = { ...item };
  showModal.value = true;
};

const handleDelete = async (item) => {
  isButtonLoading.value[item._id] = true;
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
      const { data } = await del(`whitelist-ip/${item._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchWhitelistIPs();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting whitelist IP:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value[item._id] = false;
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchWhitelistIPs();
});

useHead({
  title: "Play System | Whitelist IP",
});
</script>
