<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("contact_list") }}
          </h1>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-center justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div
          class="flex items-center gap-4 max-md:gap-2 max-md:flex-col max-md:w-full"
        >
          <LoadingButton
            :loading="isRefreshButtonLoading"
            @click="handleRefresh"
            class="bg-indigo-600 lg:hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            <div class="flex items-center gap-2">
              <Icon icon="mdi:refresh" class="max-md:w-4 max-md:h-4" />
              {{ $t("refresh") }}
            </div>
          </LoadingButton>
          <button
            v-if="
              adminUserData?.role === 'superadmin' ||
              adminUserData?.role === 'admin'
            "
            @click="handleExport"
            :disabled="isExporting || filteredContacts.length === 0"
            class="bg-green-600 lg:hover:bg-green-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:w-full"
          >
            <Icon
              :icon="
                isExporting ? 'eos-icons:loading' : 'material-symbols:download'
              "
              class="max-md:w-4 max-md:h-4"
            />
            {{ $t("export_to_excel") }}
          </button>
        </div>
        <BaseSearch
          v-model="searchQuery"
          :placeholder="$t('search_contacts')"
          @type-change="handleTypeChange"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("no") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("username") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("name") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("phone_number") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("email") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
              >
                {{ $t("created_at") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="contact in paginatedContacts"
              :key="contact._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ contact.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ contact.username }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ contact.name }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ contact.phonenumber }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ contact.email || "-" }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ formatDate(contact.createdAt) }}
              </td>
            </tr>
            <tr
              v-if="paginatedContacts.length === 0"
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
                  {{ $t("no_contacts_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        v-if="paginatedContacts.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";
import moment from "moment-timezone";

const { get } = useApiEndpoint();
const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const isRefreshButtonLoading = ref(false);
const contacts = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchContacts = async () => {
  try {
    const { data } = await get("contacts");
    if (data.success) {
      contacts.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("failed_to_load_contacts"),
    });
  }
};

const filteredContacts = computed(() => {
  let result = [...contacts.value];
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (contact) =>
        contact.username?.toLowerCase().includes(query) ||
        contact.phonenumber?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query)
    );
  }
  return result;
});

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredContacts.value.slice(start, end).map((contact, index) => ({
    ...contact,
    no: start + index + 1,
  }));
});

const totalPages = computed(() =>
  Math.ceil(filteredContacts.value.length / itemsPerPage.value)
);

const handleTypeChange = () => {
  currentPage.value = 1;
};

const handleRefresh = async () => {
  isRefreshButtonLoading.value = true;
  await fetchContacts();
  isRefreshButtonLoading.value = false;
  Swal.fire({
    icon: "success",
    title: $t("refresh_successful"),
    text: $t("data_refreshed"),
    timer: 1500,
  });
};

const handleReset = () => {
  searchQuery.value = "";
  currentPage.value = 1;
  fetchContacts();
};

const handleExport = async () => {
  try {
    const hasExportPermission =
      adminUserData.value?.role === "superadmin" ||
      adminUserData.value?.role === "admin";
    if (!hasExportPermission) {
      Swal.fire({
        icon: "error",
        title: $t("permission_denied"),
        text: $t("export_permission_required"),
      });
      return;
    }
    if (filteredContacts.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredContacts.value.map((contact, index) => ({
      ...contact,
      no: index + 1,
    }));

    const columns = {
      no: { header: $t("no"), width: 8 },
      username: { header: $t("username"), width: 15 },
      name: { header: $t("name"), width: 15 },
      phonenumber: { header: $t("phone_number"), width: 15 },
      email: { header: $t("email"), width: 25 },
      createdAt: { header: $t("created_at"), width: 20 },
    };

    const filename = `contact_list_${moment().format("YYYY-MM-DD")}`;

    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("contact_list"),
      columns,
      formatter: (value, key, item) => {
        if (key === "createdAt" && value) {
          return formatDate(value);
        }
        return value;
      },
      beforeExport: () => {},
      afterExport: (success) => {
        if (success) {
          Swal.fire({
            icon: "success",
            title: $t("export_success"),
            text: $t("file_downloaded_successfully"),
            timer: 1500,
          });
        }
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    Swal.fire({
      icon: "error",
      title: $t("export_failed"),
      text: error.message,
    });
  }
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchContacts();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Contact List",
});
</script>

<style scoped></style>
