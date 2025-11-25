<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("feedback_management") }}
        </h1>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-center text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in visibleHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="feedback in paginatedFeedbacks"
              :key="feedback._id"
              :class="[
                'lg:hover:bg-gray-50',
                needsAgentReply(feedback) ? 'bg-yellow-50' : '',
              ]"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(feedback.createdAt) }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ feedback.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ feedback.problemType }}
              </td>
              <td
                class="px-6 py-4 max-w-xs text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs max-md:max-w-[150px]"
              >
                <p class="truncate">{{ feedback.description }}</p>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1.5 max-md:flex-col"
                >
                  <BaseToggleSwitch
                    v-model="feedback.status"
                    @update:modelValue="() => handleStatusChange(feedback)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ feedback.status ? $t("solved") : $t("pending") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <button
                  @click="showFeedbackDetails(feedback)"
                  class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs max-md:whitespace-nowrap"
                >
                  {{ $t("view_details") }}
                </button>
              </td>
              <td
                v-if="
                  company.id === 'wantokplay' ||
                  company.id === 'localhost' ||
                  company.id === 'ezwin9'
                "
                class="px-6 py-4 max-md:px-3 max-md:py-3"
              >
                <button
                  @click="openAdminChat(feedback)"
                  class="px-3 py-1 bg-green-600 text-white rounded lg:hover:bg-green-500 text-sm flex items-center gap-1 mx-auto max-md:px-2 max-md:py-2 max-md:text-xs"
                >
                  <i class="fas fa-comments text-xs"></i>
                  {{ $t("chat") }}
                  <span
                    v-if="
                      feedback.conversation && feedback.conversation.length > 0
                    "
                    class="bg-green-800 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center"
                  >
                    {{ feedback.conversation.length }}
                  </span>
                </button>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <LoadingButton
                  :loading="isButtonLoading[feedback._id]"
                  @click="deleteFeedback(feedback._id)"
                  class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-sm max-md:px-2 max-md:py-2 max-md:text-xs"
                >
                  {{ $t("delete") }}
                </LoadingButton>
              </td>
            </tr>
            <tr
              v-if="paginatedFeedbacks.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="8"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_feedback_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedFeedbacks.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
    <!-- Feedback Detail Modal -->
    <FeedbackDetailsModal
      v-model:show="showDetailModal"
      :feedback="selectedFeedback"
    />

    <!-- Admin Chat Modal -->
    <TicketConversationModal
      :show="showAdminChatModal"
      :feedback-id="selectedFeedbackId"
      @close="closeAdminChat"
      @message-sent="closeAdminChat"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const isButtonLoading = ref({});
const isPageLoading = ref(true);
const { get, patch, delete: del, publicGet } = useApiEndpoint();
const tableHeaders = [
  { key: "date", label: "Date", labelCN: "日期" },
  { key: "username", label: "Username", labelCN: "用户名" },
  { key: "type", label: "Type", labelCN: "类型" },
  { key: "description", label: "Description", labelCN: "描述" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "images", label: "Images", labelCN: "图片" },
  { key: "chats", label: "Chats", labelCN: "聊天" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];
const pendingFeedbacks = useState("pendingFeedbacks");
const feedbacks = ref([]);
const showImageModal = ref(false);
const selectedImages = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const showDetailModal = ref(false);
const selectedFeedback = ref(null);
const showAdminChatModal = ref(false);
const selectedFeedbackId = ref(null);

const filteredFeedbacks = computed(() => {
  let filtered = [...feedbacks.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (feedback) =>
        feedback.username.toLowerCase().includes(searchTerm) ||
        feedback.problemType.toLowerCase().includes(searchTerm) ||
        feedback.description.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredFeedbacks.value.length / itemsPerPage.value)
);

const paginatedFeedbacks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredFeedbacks.value
    .slice(start, end)
    .map((transaction, index) => ({
      ...transaction,
      no: start + index + 1,
    }));
});

const handleTypeChange = () => {
  currentPage.value = 1;
};

const fetchFeedbacks = async () => {
  try {
    const { data } = await get("feedbacksadmin");
    if (data.success) {
      feedbacks.value = data.data;
      fetchPendingFeedbacks();
    }
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load feedbacks",
    });
  }
};

const fetchPendingFeedbacks = async () => {
  try {
    const { data } = await publicGet("pending-feedbacks-count");
    if (data.success) {
      pendingFeedbacks.value = data.count;
    }
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load feedbacks",
    });
  }
};

const company = computed(() => {
  const companyId = localStorage.getItem("companyId");
  return COMPANIES[companyId];
});
const visibleHeaders = computed(() => {
  if (
    company.value.id === "wantokplay" ||
    company.value.id === "ezwin9" ||
    company.value.id === "localhost"
  ) {
    return tableHeaders;
  }
  return tableHeaders.filter((header) => header.key !== "chats");
});

const deleteFeedback = async (id) => {
  isButtonLoading.value[id] = true;
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
    try {
      const { data } = await del(`feedbacks/${id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchFeedbacks();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
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
  isButtonLoading.value[id] = false;
};

const handleStatusChange = async (feedback) => {
  try {
    const { data } = await patch(`feedbacks/${feedback._id}/status`, {
      status: feedback.status,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchFeedbacks();
    } else {
      feedback.status = !feedback.status;
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    feedback.status = !feedback.status;
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

const needsAgentReply = (fb) => {
  if (!fb) return false;

  // only consider unresolved tickets
  if (fb.status) return false;

  const convo = fb.conversation || [];
  if (convo.length === 0) return true;
  return convo[convo.length - 1]?.sender === "customer";
};
const showFeedbackDetails = (feedback) => {
  selectedFeedback.value = feedback;
  showDetailModal.value = true;
};

const openAdminChat = (feedback) => {
  selectedFeedbackId.value = feedback._id;
  showAdminChatModal.value = true;
};

const closeAdminChat = () => {
  showAdminChatModal.value = false;
  selectedFeedbackId.value = null;
  // Refresh feedbacks to get updated conversation counts
  fetchFeedbacks();
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchFeedbacks();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Feedback",
});
</script>
