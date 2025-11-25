<template>
  <div
    class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
  >
    <!-- Basic Information Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-3 max-md:flex-wrap">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("basic_information") }}
          </h3>
          <div>
            <div v-if="!isEditing">
              <button
                @click="startEditing"
                class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
              >
                {{ $t("edit") }}
              </button>
            </div>
            <div v-else>
              <div class="flex gap-2 max-md:gap-1.5">
                <button
                  @click="cancelEditing"
                  class="px-4 py-2 bg-gray-500 text-white rounded lg:hover:bg-gray-400 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                >
                  {{ $t("cancel") }}
                </button>
                <LoadingButton
                  :loading="isButtonLoading"
                  @click="updateUser"
                  class="px-4 py-2 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
                >
                  {{ $t("save") }}
                </LoadingButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="p-6 grid grid-cols-3 gap-6 text-left max-md:p-4 max-md:grid-cols-1 max-md:gap-4"
      >
        <!-- Username -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("username") }}</label
          >
          <div class="text-sm max-md:text-xs">{{ user.username }}</div>
        </div>

        <!-- Full Name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("full_name") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.fullname }}
          </div>
          <input
            v-else
            v-model="editedUser.fullname"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Email with Reset Button -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("email") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.email || "-" }}
          </div>
          <input
            v-else
            v-model="editedUser.email"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Password with Update Button -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("password") }}</label
          >
          <button
            @click="showUpdatePasswordModal = true"
            class="px-3 py-1 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-2 max-md:py-2 max-md:text-[10px]"
          >
            {{ $t("update_password") }}
          </button>
        </div>

        <!-- Phone Number -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("phone_number") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ formatPhoneNumber(user.phonenumber) }}
          </div>
          <input
            v-else
            v-model="editedUser.phonenumber"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Date of Birth -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("date_of_birth") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            {{ user.dob || "-" }}
          </div>
          <input
            v-else
            v-model="editedUser.dob"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Referral Code -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("referral_code") }}</label
          >
          <div class="flex items-center gap-3 max-md:gap-2 max-md:flex-wrap">
            <div
              class="text-sm font-mono bg-gray-50 px-2 py-1 rounded border max-md:text-xs"
            >
              {{ user.referralCode || "-" }}
            </div>
            <button
              v-if="user.referralQrCode"
              @click="showQRModal = true"
              class="px-3 py-1 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 flex items-center gap-1 max-md:px-2 max-md:py-2 max-md:text-[10px]"
            >
              <svg
                class="w-3 h-3 max-md:w-2.5 max-md:h-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                />
              </svg>
              {{ $t("view_qr_code") }}
            </button>
          </div>
        </div>
        <div
          v-if="showQRModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          @click="showQRModal = false"
        >
          <div
            class="bg-white rounded-xl p-6 max-w-sm mx-4 text-center max-md:p-4"
            @click.stop
          >
            <div class="mb-4 max-md:mb-3">
              <h3
                class="text-lg font-semibold text-gray-900 mb-2 max-md:text-base max-md:mb-1.5"
              >
                {{ $t("Affiliate_qr_code") }}
              </h3>
            </div>

            <div
              class="bg-white p-4 rounded-lg border-2 border-gray-100 mb-4 max-md:p-3 max-md:mb-3"
            >
              <img
                :src="user.referralQrCode"
                :alt="$t('Affiliate_qr_code')"
                class="w-48 h-48 mx-auto max-md:w-40 max-md:h-40"
              />
            </div>

            <div class="mb-4 max-md:mb-3">
              <div class="text-xs text-gray-500 mb-1 max-md:text-[10px]">
                {{ $t("referral_code") }}
              </div>
              <div
                class="font-mono text-sm bg-gray-50 px-3 py-2 rounded border max-md:text-xs max-md:px-2 max-md:py-1.5"
              >
                {{ user.referralCode }}
              </div>
            </div>
            <div class="mb-4 max-md:mb-3">
              <div class="text-xs text-gray-500 mb-1 max-md:text-[10px]">
                {{ $t("referral_link") }}
              </div>
              <div
                class="font-mono text-sm bg-gray-50 px-3 py-2 rounded border break-all max-md:text-xs max-md:px-2 max-md:py-1.5"
              >
                {{ user.referralLink }}
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="showQRModal = false"
                class="flex-1 px-4 py-2 bg-gray-500 text-white rounded lg:hover:bg-gray-400 text-sm max-md:px-3 max-md:py-1.5 max-md:text-xs"
              >
                {{ $t("close") }}
              </button>
            </div>
          </div>
        </div>
        <!-- Position Taking -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("position_taking") }}</label
          >
          <div v-if="!isEditing" class="text-sm max-md:text-xs">
            <div class="text-sm max-md:text-xs">
              {{ user.positionTaking || "0" }} %
            </div>
          </div>
          <input
            v-else
            v-model="editedUser.positionTaking"
            type="text"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
          />
        </div>

        <!-- Status with Toggle -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("status") }}</label
          >

          <div class="flex items-center gap-2">
            <BaseToggleSwitch
              :model-value="props.user.status"
              @update:model-value="toggleStatus"
            />
            <div
              :class="[
                'px-3 py-1 text-xs rounded max-md:px-2 max-md:py-2 max-md:text-[10px]',
                user.status
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800',
              ]"
            >
              {{ user.status ? $t("active") : $t("inactive") }}
            </div>
          </div>
        </div>

        <!-- Withdraw Lock -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
            >{{ $t("withdraw_lock") }}</label
          >
          <BaseToggleSwitch
            :model-value="props.user.withdrawlock"
            @update:model-value="toggleWithdrawLock"
          />
        </div>
      </div>
    </div>

    <!-- Additional Information Section -->
    <div class="bg-white rounded-lg shadow text-left">
      <div class="p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-3">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("additional_information") }}
          </h3>
        </div>
      </div>

      <div class="p-6 space-y-4 max-md:p-4 max-md:space-y-3">
        <!-- Login Information -->
        <div class="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("last_login_date") }}</label
            >
            <div class="text-sm max-md:text-xs">
              {{ user.lastLogin ? formatDate(user.lastLogin) : "-" }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("register_date") }}</label
            >
            <div class="text-sm uppercase max-md:text-xs">
              {{ formatDate(user.createdAt) }}
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
              >{{ $t("last_login_ip") }}</label
            >
            <div
              class="text-sm cursor-pointer text-indigo-600 lg:hover:text-indigo-500 max-md:text-xs"
            >
              {{ user.lastLoginIp }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Password Modal -->
    <UpdateAffiliatePasswordModal
      v-if="showUpdatePasswordModal"
      v-model:show="showUpdatePasswordModal"
      :user-id="user._id"
      @updated="$emit('update')"
    />
  </div>
</template>

<script setup>
import { formatDate } from "~/utils/dateFormatter";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits([
  "update",
  "reset-email",
  "update-password",
  "manage-lucky-spin",
]);
const currency = useCurrency();
const vipLevels = ref([]);
const isButtonLoading = ref(false);
const showDuplicateIPModal = ref(false);
const selectedIP = ref("");

const adminUserData = useState("adminUserData");
const tempRemark = ref(props.user.remark);
const showUpdatePasswordModal = ref(false);
const isEditing = ref(false);
const editedUser = ref({});
const startEditing = () => {
  isEditing.value = true;
  const hasPhonePermission =
    adminUserData.value?.role === "superadmin" ||
    adminUserData.value?.permissions?.some(
      (p) => p.module === "user" && p.actions.includes("phonenumber")
    );
  editedUser.value = {
    ...props.user,
    phonenumber: hasPhonePermission ? props.user.phonenumber : "",
    referralByUsername: props.user.referralBy
      ? props.user.referralBy.username
      : "",
  };
};
const cancelEditing = () => {
  isEditing.value = false;
  editedUser.value = {};
};

const updateUser = async () => {
  isButtonLoading.value = true;
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(
      `agent/${editedUser.value._id}`,
      editedUser.value
    );
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      emit("update");
      isEditing.value = false;
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value = false;
  }
};

const toggleStatus = async () => {
  try {
    const confirmMessage =
      props.user.status === true
        ? $t("deactivate_affiliate_confirm")
        : $t("activate_affiliate_confirm");
    const result = await Swal.fire({
      title: $t("status_change_confirm"),
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });
    if (result.isConfirmed) {
      const { put } = useApiEndpoint();
      const { data } = await put(`agent/${props.user._id}/toggle-status`);
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
    console.error("Error toggling status:", error);
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

const toggleWithdrawLock = async () => {
  try {
    const { put } = useApiEndpoint();
    const { data } = await put(`agent/${props.user._id}/toggle-withdraw-lock`);
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
    console.error("Error toggling withdraw lock:", error);
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

const formatPhoneNumber = (number) => {
  if (!number) return "-";
  const hasPhonePermission =
    adminUserData.value?.role === "superadmin" ||
    adminUserData.value?.permissions?.some(
      (p) => p.module === "user" && p.actions.includes("phonenumber")
    );
  if (hasPhonePermission) {
    return number;
  } else {
    return number
      .toString()
      .replace(/^(.*)(\d{4})$/, (_, p1, p2) => "*".repeat(p1.length) + p2);
  }
};

const showQRModal = ref(false);
</script>
