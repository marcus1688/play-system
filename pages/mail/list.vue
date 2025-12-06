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
          {{ $t("mail_management") }}
        </h1>
      </div>
      <div
        class="flex items-center gap-3 max-md:gap-2 max-md:w-full max-md:flex-col"
      >
        <button
          @click="handleBirthday"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-3 max-md:py-2 max-md:text-xs max-md:w-full"
        >
          <Icon icon="mdi:cake-variant" class="text-lg max-md:text-base" />
          {{ $t("todays_birthdays") }}
        </button>
        <BaseCreateButton @click="handleCreate" />
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
        <table class="w-full text-center">
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
              v-for="mail in paginatedMails"
              :key="mail._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ mail.username }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="space-y-1">
                  <div class="text-xs text-gray-500">{{ $t("english") }}:</div>
                  <div class="text-sm text-gray-700 max-md:text-xs">
                    {{ truncateText(mail.titleEN, 30) }}
                  </div>
                  <div class="text-xs text-gray-500">{{ $t("chinese") }}:</div>
                  <div class="text-sm text-gray-700 max-md:text-xs">
                    {{ truncateText(mail.titleCN, 30) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    mail.isRead
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800',
                  ]"
                >
                  {{ mail.isRead ? $t("read") : $t("unread") }}
                </span>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(mail.createdAt) }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="editMail(mail)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[mail._id]"
                    @click="confirmDelete(mail)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedMails.length === 0"
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
                  {{ $t("no_mails_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedMails.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Birthday Modal -->
    <BirthdayModal v-model:show="showBirthdayModal" />

    <!-- Mail Form Modal -->
    <MailModal
      v-model:show="showMailModal"
      :initial-data="editingMail"
      @success="fetchMails"
    />
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";
import { Icon } from "@iconify/vue";

const isButtonLoading = ref({});
const showBirthdayModal = ref(false);
const isPageLoading = ref(true);
const { get, post, put, delete: del } = useApiEndpoint();

const tableHeaders = [
  { key: "username", label: "Username", labelCN: "用户名" },
  { key: "title", label: "Title", labelCN: "标题" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "date", label: "Date", labelCN: "日期" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const mails = ref([]);
const showMailModal = ref(false);
const editingMail = ref(null);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filteredMails = computed(() => {
  let filtered = [...mails.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (mail) =>
        mail.username.toLowerCase().includes(searchTerm) ||
        mail.titleEN.toLowerCase().includes(searchTerm) ||
        mail.titleCN.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredMails.value.length / itemsPerPage.value) || 1;
});

const paginatedMails = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredMails.value.slice(start, end).map((mails, index) => ({
    ...mails,
  }));
});

const fetchMails = async () => {
  try {
    const { data } = await get("mails");
    if (data.success) {
      mails.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching mails:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load mails",
    });
  }
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleCreate = () => {
  editingMail.value = null;
  showMailModal.value = true;
};

const editMail = (mail) => {
  editingMail.value = mail;
  showMailModal.value = true;
};

const submitMail = async () => {
  try {
    let response;
    if (editingMail.value) {
      response = await put(`mails/${editingMail.value._id}`, mailForm.value);
    } else {
      response = await post("mails", mailForm.value);
    }
    if (response.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
      closeForm();
      fetchMails();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    console.error("Error submitting mail:", error);
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

const confirmDelete = async (mail) => {
  isButtonLoading.value[mail._id] = true;
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
      const { data } = await del(`mails/${mail._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchMails();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    } catch (error) {
      console.error("Error deleting mail:", error);
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
  isButtonLoading.value[mail._id] = false;
};

const truncateText = (text, length) => {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};

const handleBirthday = () => {
  showBirthdayModal.value = true;
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchMails();
  isPageLoading.value = false;
});

useHead({
  title: "Play System | Mail",
});
</script>
