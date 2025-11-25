<template>
  <div>
    <div
      class="space-y-6 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:space-y-4"
    >
      <!-- Actions -->
      <div class="flex justify-end">
        <button
          @click="showAddBankModal = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full max-md:justify-center"
        >
          <Icon icon="material-symbols:add" class="max-md:w-4 max-md:h-4" />
          {{ $t("add_bank_account") }}
        </button>
      </div>

      <!-- Banks Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-4 border-b max-md:p-3">
          <div class="flex items-center gap-4 max-md:gap-2">
            <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
            <h3 class="text-lg font-semibold max-md:text-base">
              {{ $t("bank_accounts") }}
            </h3>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap">
            <thead class="bg-gray-50 text-center">
              <tr>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("bank_name") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("bank_name") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("account_number") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("fastpay") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("fastpay_code") }}
                </th>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("actions") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 text-center">
              <tr
                v-for="bank in banks"
                :key="bank.id"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 text-sm font-medium uppercase max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ bank.name }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ bank.bankname }}
                </td>
                <td
                  class="px-6 py-4 text-sm cursor-pointer text-indigo-600 lg:hover:text-indigo-500 max-md:px-3 max-md:py-2 max-md:text-xs"
                  @click="handleBankNumberClick(bank.banknumber)"
                >
                  {{ bank.banknumber }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ bank.fastpay || "-" }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ bank.fastpayCode || bank.bankcode || "-" }}
                </td>
                <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-2">
                  <button
                    @click="handleDeleteBank(bank._id)"
                    class="text-red-600 lg:hover:text-red-800"
                  >
                    <Icon
                      icon="material-symbols:delete"
                      class="w-5 h-5 max-md:w-4 max-md:h-4"
                    />
                  </button>
                </td>
              </tr>
              <tr v-if="banks.length === 0" class="h-[400px] max-md:h-[300px]">
                <td
                  colspan="6"
                  class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:py-3"
                >
                  <div class="flex flex-col gap-8 items-center max-md:gap-4">
                    <img
                      src="/images/empty2.png"
                      alt="Empty State"
                      class="w-32 h-auto opacity-80 max-md:w-24"
                    />
                    <span class="max-md:text-xs">{{
                      $t("no_bank_accounts_found")
                    }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Add Bank Modal -->
    <AddBankModal
      v-model:show="showAddBankModal"
      :fullname="userData?.fullname"
      @submit="handleAddBank"
    />

    <!-- Duplicate Bank Modal -->
    <DuplicateBankModal
      v-model:show="showDuplicateBankModal"
      :bankNumber="selectedBankNumber"
    />
  </div>
</template>
<script setup>
import { Icon } from "@iconify/vue";
const { get, post, delete: deleteRequest } = useApiEndpoint();

const props = defineProps({
  banks: {
    type: Array,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update"]);
const showDuplicateBankModal = ref(false);
const selectedBankNumber = ref("");
const showAddBankModal = ref(false);
const handleAddBank = async (bankData) => {
  try {
    const { data } = await post(`user/${props.userId}/bank-accounts`, bankData);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error adding bank account:", error);
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

const handleDeleteBank = async (bankId) => {
  try {
    const willDelete = await Swal.fire({
      title: $t("delete_confirmation"),
      text: $t("delete_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });

    if (willDelete.isConfirmed) {
      const { data } = await deleteRequest(
        `user/${props.userId}/bank-accounts/${bankId}`
      );
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        emit("update");
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting bank account:", error);
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

const handleBankNumberClick = (bankNumber) => {
  selectedBankNumber.value = bankNumber;
  showDuplicateBankModal.value = true;
};
</script>
