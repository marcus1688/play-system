<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-3"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div class="bg-white rounded-lg w-[600px] p-6 max-w-full max-md:p-4">
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:gap-3 max-md:items-start"
        >
          <div class="flex items-center gap-4 max-md:gap-3">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h2 class="text-xl font-semibold max-md:text-lg">
              {{ $t("game_account") }}
            </h2>
          </div>
          <LoadingButton
            :loading="isGenerating"
            @click="handleGenerateAccount"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 text-sm max-md:w-full max-md:px-3 max-md:py-1.5 max-md:text-xs"
          >
            {{ $t("generate_account") }}
          </LoadingButton>
        </div>

        <!-- Current Account -->
        <div class="mb-6 max-md:mb-4">
          <h3 class="text-lg font-medium mb-3 max-md:text-base max-md:mb-2">
            {{ $t("current_account") }}
          </h3>
          <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
            <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-3">
              <div>
                <label
                  class="block text-sm text-gray-600 mb-1 max-md:text-xs"
                  >{{ $t("game_id") }}</label
                >
                <div class="font-medium max-md:text-sm">
                  {{ userData[game.databaseGameID] || $t("not_available") }}
                </div>
              </div>
              <div>
                <label
                  class="block text-sm text-gray-600 mb-1 max-md:text-xs"
                  >{{ $t("password") }}</label
                >
                <div class="font-medium max-md:text-sm">
                  {{
                    userData[game.databaseGamePassword] || $t("not_available")
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Accounts -->
        <div>
          <h3 class="text-lg font-medium mb-3 max-md:text-base max-md:mb-2">
            {{ $t("past_accounts") }}
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-center">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-2 text-sm font-medium text-gray-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("game_id") }}
                  </th>
                  <th
                    class="px-4 py-2 text-sm font-medium text-gray-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("password") }}
                  </th>
                  <th
                    class="px-4 py-2 text-sm font-medium text-gray-500 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ $t("actions") }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr
                  v-for="account in paginatedAccounts"
                  :key="account.actualIndex"
                  class="lg:hover:bg-gray-50"
                >
                  <td
                    class="px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ account.gameId }}
                  </td>
                  <td
                    class="px-4 py-2 max-md:px-2 max-md:py-1.5 max-md:text-xs"
                  >
                    {{ account.gamePassword }}
                  </td>
                  <td class="px-4 py-2 max-md:px-2 max-md:py-1.5">
                    <button
                      @click="
                        handleSetAsMain(account.gameId, account.gamePassword)
                      "
                      class="px-3 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-2 max-md:py-1 max-md:text-[10px]"
                      :disabled="settingMainMap.get(account.gameId)"
                    >
                      {{
                        settingMainMap.get(account.gameId)
                          ? $t("setting_loading")
                          : $t("set_as_main")
                      }}
                    </button>
                  </td>
                </tr>
                <tr
                  v-if="!props.userData[props.game.databasePastGameID]?.length"
                >
                  <td
                    colspan="3"
                    class="px-4 py-2 text-center text-gray-500 max-md:px-2 max-md:text-sm"
                  >
                    {{ $t("no_past_accounts") }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="px-4 py-3 max-md:px-2 max-md:py-2">
                    <BasePagination
                      v-if="paginatedAccounts.length > 0"
                      v-model="currentPage"
                      :total-pages="totalPages"
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div></div
  ></Teleport>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  game: {
    type: Object,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:show", "refresh"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { post } = useApiEndpoint();
const isGenerating = ref(false);
const isSettingMain = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const settingMainMap = ref(new Map());

const handleSetAsMain = async (selectedGameId, selectedPassword) => {
  try {
    settingMainMap.value.set(selectedGameId, true);
    if (!props.game.setAsMainAPI) {
      throw new Error($t("set_main_api_error"));
    }

    const endpoint = props.game.setAsMainAPI.replace(
      ":userId",
      props.userData._id
    );
    const { data } = await post(endpoint, {
      selectedGameId,
      selectedPassword,
    });
    console.log(data);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("account_updated"),
        text:
          data.message[$locale.value] ||
          data.message.en ||
          $t("set_as_main_success"),
        timer: 1500,
      });
      emit("refresh");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text:
          data.message[$locale.value] ||
          data.message.en ||
          $t("set_as_main_error"),
      });
    }
  } catch (error) {
    console.error("Error setting main account:", error);
    await Swal.fire({
      icon: "error",
      title: $t("update_failed"),
      text: error.message || $t("set_as_main_error"),
    });
  } finally {
    settingMainMap.value.delete(selectedGameId);
  }
};

const handleGenerateAccount = async () => {
  try {
    isGenerating.value = true;
    if (!props.game.registerGameAPI) {
      throw new Error($t("register_api_error"));
    }

    const endpoint = props.game.registerGameAPI.replace(
      ":userId",
      props.userData._id
    );
    const { data } = await post(endpoint);

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("account_generated"),
        text:
          data.message[$locale.value] ||
          data.message.en ||
          $t("generate_success"),
        timer: 1500,
      });
      emit("refresh");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text:
          data.message[$locale.value] ||
          data.message.en ||
          $t("generate_error"),
      });
    }
  } catch (error) {
    console.error("Error generating account:", error);
    await Swal.fire({
      icon: "error",
      title: $t("generation_failed"),
      text: error.message || $t("generate_error"),
    });
  } finally {
    isGenerating.value = false;
  }
};

const paginatedAccounts = computed(() => {
  const pastGameIds = props.userData[props.game.databasePastGameID] || [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return pastGameIds.slice(start, end).map((_, index) => ({
    actualIndex: start + index,
    gameId: props.userData[props.game.databasePastGameID][start + index],
    gamePassword:
      props.userData[props.game.databasePastGamePassword][start + index],
  }));
});

const totalPages = computed(() => {
  const pastGameIds = props.userData[props.game.databasePastGameID] || [];
  return Math.ceil(pastGameIds.length / itemsPerPage.value);
});
</script>
