<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("agent_pt_list") }}
        </h1>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-2 max-md:w-full">
          <BaseSearch v-model="searchQuery" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase whitespace-nowrap max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div
                  class="flex items-center justify-center gap-2 max-md:gap-1"
                >
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <div v-if="header.sortable">
                    <Icon
                      :icon="
                        sortConfig.key === header.key
                          ? sortConfig.direction === 'asc'
                            ? 'material-symbols:arrow-upward'
                            : 'material-symbols:arrow-downward'
                          : 'material-symbols:unfold-more'
                      "
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-center">
            <tr
              v-for="user in paginatedUsers"
              :key="user._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.no }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.username }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ user.fullname }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div
                  v-if="editingUserId === user._id"
                  class="flex justify-center gap-2 max-md:gap-1 max-md:flex-col max-md:items-center"
                >
                  <input
                    v-model="editPositionTaking"
                    type="text"
                    class="w-20 px-2 py-1 border rounded max-md:w-16 max-md:px-1.5 max-md:py-2 max-md:text-xs"
                  />
                  <div class="flex gap-1">
                    <button
                      @click="savePositionTaking(user._id)"
                      class="px-2 py-1 bg-green-500 text-white rounded max-md:px-1.5 max-md:py-2"
                    >
                      <Icon
                        icon="mdi:check"
                        class="max-md:w-3.5 max-md:h-3.5"
                      />
                    </button>
                    <button
                      @click="cancelEdit"
                      class="px-2 py-1 bg-red-500 text-white rounded max-md:px-1.5 max-md:py-2"
                    >
                      <Icon
                        icon="mdi:close"
                        class="max-md:w-3.5 max-md:h-3.5"
                      />
                    </button>
                  </div>
                </div>
                <div
                  v-else
                  class="flex items-center justify-center gap-2 max-md:gap-1"
                >
                  <span>{{ user.positionTaking }}</span>
                  <button
                    @click="startEdit(user)"
                    class="p-1 text-indigo-600 lg:hover:bg-indigo-100 rounded max-md:p-0.5"
                  >
                    <Icon icon="mdi:pencil" class="max-md:w-3.5 max-md:h-3.5" />
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-3">
                <button
                  @click="viewDownlines(user._id)"
                  class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-xs"
                >
                  {{ $t("view") }}
                </button>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(user.lastLogin) }}
              </td>
            </tr>
            <tr
              v-if="paginatedUsers.length === 0"
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
                  {{ $t("no_users_with_position") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedUsers.length !== 0"
        v-model="currentPage"
        :totalPages="totalPages"
      />

      <DownlinesModal
        v-model:show="showDownlinesModal"
        :downlines="downlinesData"
        :is-loading="isLoadingDownlines"
        :error="downlinesError"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const isPageLoading = ref(true);
const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号", sortable: false },
  { key: "username", label: "Username", labelCN: "用户名", sortable: true },
  { key: "fullname", label: "Full Name", labelCN: "全名", sortable: true },
  {
    key: "positionTaking",
    label: "Position Taking",
    labelCN: "持仓",
    sortable: true,
  },
  { key: "downlines", label: "Downlines", labelCN: "下线", sortable: false },
  {
    key: "lastLogin",
    label: "Last Login",
    labelCN: "最后登录",
    sortable: true,
  },
];

const sortConfig = ref({
  key: "positionTaking",
  direction: "desc",
});

const { get, put } = useApiEndpoint();
const users = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const editingUserId = ref(null);
const editPositionTaking = ref("");
const showDownlinesModal = ref(false);
const selectedUserId = ref(null);
const isLoadingDownlines = ref(false);
const downlinesData = ref([]);
const downlinesError = ref(null);

const handleSort = (key) => {
  if (!tableHeaders.find((h) => h.key === key).sortable) return;

  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};

const fetchPositionTakingUsers = async () => {
  try {
    const { data } = await get("position-taking-users");
    if (data.success) {
      users.value = data.data.map((user, index) => ({
        ...user,
        no: index + 1,
      }));
      isPageLoading.value = false;
    }
  } catch (error) {
    console.error("Error fetching position taking users:", error);
    isPageLoading.value = false;
  }
};

const startEdit = (user) => {
  editingUserId.value = user._id;
  editPositionTaking.value = user.positionTaking;
};

const cancelEdit = () => {
  editingUserId.value = null;
  editPositionTaking.value = "";
};

const viewDownlines = async (userId) => {
  selectedUserId.value = userId;
  showDownlinesModal.value = true;
  await fetchDownlines(userId);
};

const fetchDownlines = async (userId) => {
  isLoadingDownlines.value = true;
  downlinesError.value = null;
  downlinesData.value = [];
  try {
    const { data } = await get(`position-taking-downlines/${userId}`);
    if (data.success) {
      const allDownlines = [
        ...(data.data.downlines.direct || []),
        ...(data.data.downlines.indirect || []),
      ];
      downlinesData.value = allDownlines;
    } else {
      downlinesError.value =
        data.message[$locale.value] || data.message.en || $t("fetch_failed");
    }
  } catch (error) {
    console.error("Error fetching downlines:", error);
    downlinesError.value = $t("fetch_failed");
  } finally {
    isLoadingDownlines.value = false;
  }
};

const savePositionTaking = async (userId) => {
  try {
    const { data } = await put(`update-position-taking/${userId}`, {
      positionTaking: editPositionTaking.value,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      const userIndex = users.value.findIndex((user) => user._id === userId);
      if (userIndex !== -1) {
        users.value[userIndex].positionTaking = editPositionTaking.value;
      }
      cancelEdit();
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating position taking:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("update_failed"),
    });
  }
};

const filteredUsers = computed(() => {
  let filtered = [...users.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.username.toLowerCase().includes(searchTerm) ||
        item.fullname.toLowerCase().includes(searchTerm)
    );
  }

  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (sortConfig.value.key === "lastLogin") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }

  return filtered;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end).map((user, index) => ({
    ...user,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage.value)
);

watch(searchQuery, () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchPositionTakingUsers();
});

useHead({
  title: "Money System | Agent PT List",
});
</script>
```
