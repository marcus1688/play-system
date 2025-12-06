<template>
  <div class="space-y-6 min-w-[500px] overflow-x-auto max-md:min-w-0">
    <PageLoading v-if="isPageLoading" />
    <div v-else>
      <TransferDownlineModal
        :show="showTransferModal"
        @update:show="showTransferModal = $event"
        @userUpdated="handleUserUpdated"
      />
      <!-- User Info Section -->
      <div class="bg-white rounded-lg shadow mb-6 max-md:mb-4" v-if="userData">
        <div class="p-4 border-b max-md:p-3">
          <div class="flex items-center gap-4 max-md:gap-2">
            <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
            <h3 class="text-lg font-semibold max-md:text-base">
              {{ $t("agent_information") }}
            </h3>
          </div>
        </div>
        <div
          class="p-6 grid grid-cols-3 gap-6 max-md:p-3 max-md:grid-cols-1 max-md:gap-3"
        >
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("userid") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ props.userData.userid }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("fullname") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ props.userData.fullname }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("total_downlines") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ userData.summary.totalDownlines }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("direct_downlines") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ userData.summary.totalDirect }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("indirect_downlines") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ userData.summary.totalIndirect }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("valid_users") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ userData.summary.validUsers }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div
        class="border-b px-6 bg-white rounded-t-lg shadow flex justify-between items-center max-md:px-3 max-md:flex-col max-md:items-stretch max-md:gap-3"
      >
        <nav
          class="flex gap-6 whitespace-nowrap overflow-x-auto pb-4 max-md:gap-3 max-md:pb-3"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'py-4 relative font-medium max-md:py-2 max-md:text-sm',
              activeTab === tab.value
                ? 'text-indigo-600'
                : 'text-gray-500 lg:hover:text-gray-700',
            ]"
          >
            {{ $i18n.locale === "zh" ? tab.labelCN : tab.label }}
            <div
              v-if="activeTab === tab.value"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
            ></div>
          </button>
        </nav>
        <div class="mb-6 flex gap-3 max-md:mb-3 max-md:gap-2 max-md:flex-col">
          <button
            @click="showTransferModal = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("setup_downline") }}
          </button>
          <button
            @click="handleRemoveReferral"
            class="px-4 py-2 bg-red-600 text-white rounded-lg lg:hover:bg-red-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
          >
            {{ $t("remove_referral") }}
          </button>
        </div>
      </div>

      <!-- Direct Downlines Table -->
      <div v-if="activeTab === 'direct'" class="bg-white rounded-b-lg shadow">
        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap">
            <thead class="bg-gray-50 text-center">
              <tr>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("user_id") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("username") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("vip_level") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("status") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("last_deposit") }}
                </th>

                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("registration_date") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-center">
              <tr
                v-for="user in userData.downlines.direct"
                :key="user._id"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ user.userid || "-" }}
                </td>
                <td
                  class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ user.username }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ user.viplevel || "-" }}
                </td>
                <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-2">
                  <div
                    :class="[
                      'px-3 py-1 text-xs rounded inline-block max-md:px-2 max-md:py-2 max-md:text-[10px]',
                      user.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ user.status ? $t("active") : $t("inactive") }}
                  </div>
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ formatDate(user.lastdepositdate) }}
                </td>

                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ formatDate(user.createdAt) }}
                </td>
              </tr>
              <tr v-if="userData.downlines.direct.length === 0">
                <td
                  colspan="8"
                  class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:py-3"
                >
                  <div class="flex flex-col gap-8 items-center max-md:gap-4">
                    <img
                      src="/images/empty2.png"
                      alt="Empty State"
                      class="w-32 h-auto opacity-80 max-md:w-24"
                    />
                    <span class="max-md:text-xs">{{
                      $t("no_direct_downlines")
                    }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { formatDate } from "~/utils/dateFormatter";
import { Icon } from "@iconify/vue";

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["userUpdated"]);
const { get, post, publicPost } = useApiEndpoint();
const userData = ref(null);
const isPageLoading = ref(true);
const error = ref(null);
const activeTab = ref("direct");
const showTransferModal = ref(false);

const tabs = [
  { label: "Direct Downlines", labelCN: "直接下线", value: "direct" },
];

const fetchUserDownlines = async () => {
  isPageLoading.value = true;
  error.value = null;
  try {
    const { data } = await get(`user-downlines/${props.userId}`);
    if (data.success) {
      userData.value = data.data;
    } else {
      error.value =
        data.message[$locale.value] ||
        data.message.en ||
        "Failed to fetch downlines";
    }
  } catch (err) {
    console.error("Error fetching user downlines:", err);
    error.value =
      err.response?.data?.message?.[$locale.value] ||
      err.response?.data?.message?.en ||
      $t("network_error");
  } finally {
    isPageLoading.value = false;
  }
};

const handleUserUpdated = () => {
  emit("update");
  fetchUserDownlines();
};

const handleRemoveReferral = async () => {
  const confirmResult = await Swal.fire({
    title: $t("confirm_remove_referral"),
    text: $t("remove_referral_warning", { username: props.userData.username }),
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#6b7280",
    confirmButtonText: $t("yes_remove"),
    cancelButtonText: $t("cancel"),
  });
  if (confirmResult.isConfirmed) {
    try {
      const { data } = await publicPost("remove-referral", {
        username: props.userData.username,
      });
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        fetchUserDownlines();
        emit("update");
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error removing referral:", error);
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text:
          error.response?.data?.message?.[$locale.value] ||
          error.response?.data?.message?.en ||
          $t("network_error"),
      });
    }
  }
};

onMounted(() => {
  fetchUserDownlines();
});
</script>
