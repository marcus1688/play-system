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
          {{ $t("lucky_spin_setting") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="overflow-x-auto rounded-lg">
        <table class="w-full text-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("name") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("angle") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("probability") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("value") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                {{ $t("value") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="prize in prizes"
              :key="prize._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div v-if="editingId === prize._id">
                  <input
                    v-model="editForm.name"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  />
                </div>
                <div v-else>{{ prize.name }}</div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div v-if="editingId === prize._id">
                  <input
                    v-model.number="editForm.angle"
                    type="number"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  />
                </div>
                <div v-else>{{ prize.angle }}°</div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div v-if="editingId === prize._id">
                  <input
                    v-model.number="editForm.probability"
                    type="number"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  />
                </div>
                <div v-else>{{ prize.probability }}</div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <div v-if="editingId === prize._id">
                  <input
                    v-model.number="editForm.value"
                    type="number"
                    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 max-md:px-2 max-md:py-1 max-md:text-xs"
                  />
                </div>
                <div v-else>${{ prize.value }}</div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="flex items-center gap-2 max-md:gap-1">
                  <div
                    v-if="editingId === prize._id"
                    class="flex gap-2 max-md:gap-1 max-md:flex-col"
                  >
                    <button
                      @click="handleUpdate(prize._id)"
                      class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("save") }}
                    </button>
                    <button
                      @click="cancelEdit"
                      class="px-3 py-1 bg-gray-500 text-white rounded lg:hover:bg-gray-400 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("cancel") }}
                    </button>
                    <button
                      @click="handleDelete(prize._id)"
                      class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                    >
                      {{ $t("delete") }}
                    </button>
                  </div>
                  <button
                    v-else
                    @click="startEdit(prize)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Deposit Amount Section -->
    <div class="bg-white rounded-lg shadow my-6 p-6 max-md:my-4 max-md:p-4">
      <div
        class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4"
      >
        <div
          class="flex items-center gap-4 max-md:flex-col max-md:items-start max-md:gap-2"
        >
          <div>
            <h2
              v-if="['localhost', 'bm8my', 'bm8sg'].includes(getCompanyId())"
              class="text-lg font-medium text-gray-800 max-md:text-base"
            >
              {{ $t("lucky_spin_point_rate") }}
            </h2>
            <h2
              v-else
              class="text-lg font-medium text-gray-800 max-md:text-base"
            >
              {{ $t("lucky_spin_deposit_rate") }}
            </h2>
          </div>
          <div
            v-if="!['localhost', 'bm8my', 'bm8sg'].includes(getCompanyId())"
            class="text-sm text-gray-500 max-md:text-xs"
          >
            {{ $t("deposit_rate_description") }}
          </div>
        </div>
        <div class="flex items-center gap-4 max-md:w-full max-md:gap-2">
          <div
            v-if="isEditingDeposit"
            class="flex items-center gap-2 max-md:flex-col max-md:w-full max-md:gap-2"
          >
            <input
              v-model.number="depositAmount"
              type="number"
              class="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 max-md:w-full max-md:px-2 max-md:py-1 max-md:text-xs"
              :placeholder="$t('enter_amount')"
            />
            <div class="flex gap-2 max-md:w-full max-md:gap-1">
              <button
                @click="handleUpdateDeposit"
                class="px-3 py-1.5 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
              >
                {{ $t("save") }}
              </button>
              <button
                @click="cancelEditDeposit"
                class="px-3 py-1.5 bg-gray-500 text-white rounded lg:hover:bg-gray-400 text-sm max-md:px-2 max-md:py-1 max-md:text-xs max-md:w-full"
              >
                {{ $t("cancel") }}
              </button>
            </div>
          </div>
          <div
            v-else
            class="flex items-center gap-4 max-md:w-full max-md:justify-between max-md:gap-2"
          >
            <span class="text-lg font-medium max-md:text-base"
              >${{ currentDepositAmount }}</span
            >
            <button
              @click="startEditDeposit"
              class="px-3 py-1.5 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-sm max-md:px-2 max-md:py-1 max-md:text-xs"
            >
              {{ $t("edit") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Lucky Spin Modal -->
    <LuckySpinModal v-model:show="showLuckySpinModal" @success="fetchPrizes" />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { getCompanyId } = useCompany();
const isEditingDeposit = ref(false);
const depositAmount = ref(0);
const currentDepositAmount = ref(0);
const isPageLoading = ref(true);
const formData = ref({
  name: "",
  angle: "",
  probability: "",
  value: "",
});
const showLuckySpinModal = ref(false);
const handleCreate = () => {
  showLuckySpinModal.value = true;
};

const prizes = ref([]);

const message = ref("");
const messageClass = computed(() =>
  message.value.includes("success") ? "bg-green-50" : "bg-red-50"
);

const editingId = ref(null);
const editForm = ref({
  name: "",
  angle: "",
  probability: "",
  value: "",
});

const startEdit = (prize) => {
  editingId.value = prize._id;
  editForm.value = {
    name: prize.name,
    angle: prize.angle,
    probability: prize.probability,
    value: prize.value,
  };
};

const cancelEdit = () => {
  editingId.value = null;
  editForm.value = {
    name: "",
    angle: "",
    probability: "",
    value: "",
  };
};

const handleSubmit = async () => {
  try {
    const { post } = useApiEndpoint();
    const { data } = await post("createLuckySpin", formData.value);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      formData.value = { name: "", angle: "", probability: "", value: "" };
      await fetchPrizes();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
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
  }
};

const fetchPrizes = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("getLuckySpin");
    prizes.value = data.prizes;
  } catch (error) {
    console.error("Failed to fetch prizes:", error);
  }
};

const handleUpdate = async (id) => {
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`updateLuckySpin/${id}`, editForm.value);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
      });
      await fetchPrizes();
      editingId.value = null;
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
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
  }
};

const handleDelete = async (id) => {
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
      const { delete: destroy } = useApiEndpoint();
      const { data } = await destroy(`luckySpin/${id}`);

      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchPrizes();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
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

const fetchDepositAmount = async () => {
  try {
    const { get } = useApiEndpoint();
    const { data } = await get("getLuckySpinDepositAmount");
    currentDepositAmount.value = data?.success ? data.depositAmount : 0;
  } catch (error) {
    console.error("Failed to fetch deposit amount:", error);
    currentDepositAmount.value = 0;
  }
};

const startEditDeposit = () => {
  isEditingDeposit.value = true;
  depositAmount.value = currentDepositAmount.value;
};

const cancelEditDeposit = () => {
  isEditingDeposit.value = false;
  depositAmount.value = currentDepositAmount.value;
};

const handleUpdateDeposit = async () => {
  try {
    const { post } = useApiEndpoint();
    const { data } = await post("updateLuckySpinDepositAmount", {
      depositAmount: depositAmount.value,
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      currentDepositAmount.value = depositAmount.value;
      isEditingDeposit.value = false;
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
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
  }
};

onMounted(async () => {
  await Promise.all([fetchPrizes(), fetchDepositAmount()]);
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Lucky Spin Setting",
});
</script>
