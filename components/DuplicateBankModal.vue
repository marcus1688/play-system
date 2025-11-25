<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[800px] max-h-[90vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3 max-md:flex-wrap">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <div class="flex items-center gap-2">
              <Icon
                icon="material-symbols:error"
                class="text-red-500 max-md:w-5 max-md:h-5"
              />
              <h2 class="text-xl font-semibold max-md:text-base">
                {{ $t("users_with_bank_number") }}: {{ bankNumber }}
              </h2>
            </div>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <div
            v-if="loading"
            class="text-center py-8 flex justify-center max-md:py-6"
          >
            <Icon
              icon="line-md:loading-twotone-loop"
              class="text-indigo-600 w-8 h-8 max-md:w-6 max-md:h-6"
            />
          </div>

          <div
            v-else-if="users.length === 0"
            class="text-center py-8 text-gray-500 max-md:py-6 max-md:text-sm"
          >
            {{ $t("no_users_found_bank") }}
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-center">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-2 max-md:py-2"
                  >
                    {{ $t("username") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-2 max-md:py-2"
                  >
                    {{ $t("full_name") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-2 max-md:py-2"
                  >
                    {{ $t("bank_name") }}
                  </th>
                  <th
                    class="px-4 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-2 max-md:py-2"
                  >
                    {{ $t("account_number") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <template v-for="user in users" :key="user.username">
                  <tr
                    v-for="account in user.bankAccounts"
                    :key="`${user.username}-${account._id}`"
                    class="lg:hover:bg-gray-50"
                  >
                    <td
                      class="px-4 py-4 text-sm font-medium max-md:px-2 max-md:py-3 max-md:text-xs"
                    >
                      {{ user.username }}
                    </td>
                    <td
                      class="px-4 py-4 text-sm text-gray-600 max-md:px-2 max-md:py-3 max-md:text-xs"
                    >
                      {{ user.fullname }}
                    </td>
                    <td
                      class="px-4 py-4 text-sm max-md:px-2 max-md:py-3 max-md:text-xs"
                    >
                      {{ account.bankname }}
                    </td>
                    <td
                      class="px-4 py-4 text-sm max-md:px-2 max-md:py-3 max-md:text-xs"
                    >
                      {{ account.banknumber }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>

        <div class="p-6 border-t flex justify-end gap-3 max-md:p-4">
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 bg-gray-500 text-white rounded lg:hover:bg-gray-400 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-sm"
          >
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";

const props = defineProps({
  show: Boolean,
  bankNumber: String,
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const users = ref([]);
const loading = ref(false);
const { get } = useApiEndpoint();

watch(
  () => props.show,
  async (newVal) => {
    if (newVal && props.bankNumber) {
      loading.value = true;
      try {
        const { data } = await get(`users/find-by-bank/${props.bankNumber}`);
        if (data.success) {
          users.value = data.data;
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        loading.value = false;
      }
    } else {
      users.value = [];
    }
  }
);
</script>
