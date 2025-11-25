<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-y-auto max-w-full"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center gap-4 max-md:gap-3 max-md:flex-wrap">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <div class="flex items-center gap-2">
              <Icon
                icon="material-symbols:warning"
                class="text-amber-500 max-md:w-5 max-md:h-5"
              />
              <h2 class="text-xl font-semibold max-md:text-base break-all">
                {{ $t("users_with_ip") }}: {{ ip }}
              </h2>
            </div>
          </div>
        </div>

        <div class="p-6 max-md:p-4">
          <div class="space-y-4 max-md:space-y-3">
            <div v-if="loading" class="text-center py-4 max-md:py-3">
              <Icon
                icon="line-md:loading-twotone-loop"
                class="text-indigo-600 w-8 h-8 max-md:w-6 max-md:h-6"
              />
            </div>

            <div
              v-else-if="users.length === 0"
              class="text-center py-4 text-gray-500 max-md:py-3 max-md:text-sm"
            >
              {{ $t("no_users_found_ip") }}
            </div>

            <div v-else class="space-y-2 max-md:space-y-1.5">
              <div
                v-for="user in users"
                :key="user.username"
                class="p-3 bg-gray-50 rounded-lg flex items-center justify-between max-md:p-2"
              >
                <div class="flex items-center gap-2">
                  <div>
                    <div class="flex gap-1 max-md:flex-col max-md:gap-0">
                      <div class="font-medium max-md:text-sm">
                        {{ user.username }}
                      </div>
                      <div class="text-sm text-gray-500 max-md:text-xs">
                        <template v-if="user.matchedWith.lastLoginIp">
                          ({{ $t("last_login_ip") }})
                        </template>
                        <template v-if="user.matchedWith.registerIp">
                          ({{ $t("register_ip") }})
                        </template>
                      </div>
                    </div>
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ user.fullname }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
  ip: String,
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
    if (newVal && props.ip) {
      loading.value = true;
      try {
        const { data } = await get(`users/find-by-ip/${props.ip}`);
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
