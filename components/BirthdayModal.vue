<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col"
      >
        <div
          class="flex items-center justify-between p-6 border-b flex-shrink-0 max-md:p-4 max-md:flex-col max-md:items-start max-md:gap-2"
        >
          <div class="flex items-center gap-4 max-md:gap-3">
            <Icon
              icon="mdi:cake-variant"
              class="text-2xl text-green-600 max-md:text-xl"
            />
            <h3 class="text-xl font-medium max-md:text-lg">
              {{ $t("todays_birthday_users") }}
            </h3>
          </div>
          <div class="text-sm text-gray-500 max-md:text-xs max-md:ml-9">
            {{ currentDate }} (GMT+11)
          </div>
        </div>

        <div class="p-6 overflow-y-auto flex-grow max-md:p-4">
          <div v-if="isLoading" class="flex justify-center py-8 max-md:py-6">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 max-md:h-6 max-md:w-6"
            ></div>
          </div>

          <div
            v-else-if="birthdayUsers.length === 0"
            class="py-8 text-center text-gray-500 max-md:py-6"
          >
            <Icon
              icon="mdi:emoticon-sad"
              class="text-4xl mb-2 mx-auto max-md:text-3xl max-md:mb-1.5"
            />
            <p class="max-md:text-sm">{{ $t("no_birthday_users_today") }}</p>
          </div>

          <div v-else class="space-y-3 max-md:space-y-2">
            <div
              v-for="user in birthdayUsers"
              :key="user.username"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg lg:hover:bg-gray-100 transition-colors max-md:p-2 max-md:flex-col max-md:items-start max-md:gap-1"
            >
              <div>
                <div class="font-medium max-md:text-sm">
                  {{ user.username }}
                </div>
                <div class="text-sm text-gray-500 max-md:text-xs">
                  {{ user.fullname }}
                </div>
              </div>
              <div class="text-sm text-gray-500 max-md:text-xs">
                {{ $t("born") }}: {{ user.dob }}
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex justify-end gap-2 px-6 py-4 bg-gray-50 rounded-b-lg flex-shrink-0 max-md:px-4 max-md:py-3"
        >
          <button
            @click="$emit('update:show', false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-xs"
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
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const isLoading = ref(true);
const birthdayUsers = ref([]);
const currentDate = ref("");
const { get } = useApiEndpoint();

const fetchBirthdayUsers = async () => {
  try {
    isLoading.value = true;
    const { data } = await get("getTodayBirthdayUsers");
    if (data.success) {
      birthdayUsers.value = data.birthdayUsers;
      currentDate.value = data.date;
    }
  } catch (error) {
    console.error("Error fetching birthday users:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch birthday users",
    });
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchBirthdayUsers();
    }
  }
);
</script>
