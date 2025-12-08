<template>
  <div
    class="space-y-6 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:space-y-4"
  >
    <PageLoading v-if="isPageLoading" />
    <!-- Games Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:gap-2">
          <div class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"></div>
          <h3 class="text-lg font-semibold max-md:text-base">
            {{ $t("game_details") }}
          </h3>
        </div>
      </div>

      <!-- Date Filter -->
      <div class="p-4 max-md:p-3">
        <div class="flex justify-between gap-4 max-xl:flex-col max-md:gap-3">
          <div
            class="flex items-center gap-2 max-md:flex-col max-md:items-stretch"
          >
            <GameDetailsDatePicker
              v-model="dateRange.startDate"
              :placeholder="$t('start_date')"
              :is-start-date="true"
              :other-date="dateRange.endDate"
              @update:otherDate="dateRange.endDate = null"
            />
            <span class="text-gray-500 max-md:hidden">-</span>
            <GameDetailsDatePicker
              v-model="dateRange.endDate"
              :placeholder="$t('end_date')"
              :is-start-date="false"
              :other-date="dateRange.startDate"
            />
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap text-center">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("game_name") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("game_category") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("wallet_balance") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("game_id") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px] hidden"
              >
                {{ $t("lock_transfer_in") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px] hidden"
              >
                {{ $t("lock_transfer_out") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("turnover") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("win_loss") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
              >
                {{ $t("actions") }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="game in games"
              :key="game.id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-2">
                <div class="flex flex-col items-center gap-2">
                  <img
                    :src="game.logo || game.icon"
                    :alt="game.name"
                    class="w-24 h-auto object-contain rounded max-md:w-16"
                  />
                  <span class="text-sm font-medium max-md:text-xs">{{
                    game.name
                  }}</span>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <div class="flex flex-col gap-2 max-md:gap-1">
                  <span
                    v-for="category in game.categories"
                    :key="category._id"
                    class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded max-md:text-[10px] max-md:px-1.5 max-md:py-2"
                  >
                    {{ category.name || "-" }}
                  </span>
                </div>
              </td>

              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <div class="flex justify-center items-center">
                  <div v-if="game.isHTMLGame || game.isManualGame">
                    <div class="flex justify-center items-center gap-2">
                      {{ currency }} {{ gameBalances[game._id] || "0.00" }}
                      <button
                        @click="checkGameBalance(game)"
                        class="text-indigo-600 lg:hover:text-indigo-800"
                        :disabled="isCheckingBalance[game._id]"
                      >
                        <Icon
                          icon="material-symbols:refresh"
                          class="w-4 h-4 max-md:w-3 max-md:h-3"
                          :class="[
                            isCheckingBalance[game._id] ? 'animate-spin' : '',
                          ]"
                        />
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <span class="text-gray-500">Seamless</span>
                  </div>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                <div class="flex justify-center items-center gap-1">
                  <span v-if="userData[game.databaseGameID]" class="font-mono">
                    {{ userData[game.databaseGameID] }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                  <button
                    v-if="userData[game.databaseGameID]"
                    @click="copyToClipboard(userData[game.databaseGameID])"
                    class="text-gray-400 lg:hover:text-indigo-600"
                  >
                    <Icon
                      icon="mdi:content-copy"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-2 hidden">
                <div class="flex justify-center items-center">
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :checked="
                        game.isHTMLGame || game.isManualGame
                          ? userData.gameStatus[game.databaseName]
                              ?.transferInStatus
                          : userData.gameLock[game.databaseName]?.lock
                      "
                      class="sr-only peer"
                      @change="toggleLockTransferIn(game)"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 max-md:w-9 max-md:h-5 max-md:after:h-4 max-md:after:w-4"
                    ></div>
                  </label>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-2 hidden">
                <div class="flex justify-center items-center">
                  <div v-if="game.isHTMLGame || game.isManualGame">
                    <label
                      class="relative inline-flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        :checked="
                          userData.gameStatus[game.databaseName]
                            ?.transferOutStatus
                        "
                        class="sr-only peer"
                        @change="toggleLockTransferOut(game)"
                      />
                      <div
                        class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 max-md:w-9 max-md:h-5 max-md:after:h-4 max-md:after:w-4"
                      ></div>
                    </label>
                  </div>
                  <div v-else>
                    <span class="text-gray-500">Seamless</span>
                  </div>
                </div>
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ gameSummary[game._id]?.turnover || "0.00" }}
              </td>
              <td
                class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                :class="getWinLossClass(gameSummary[game._id]?.winloss || 0)"
              >
                {{ currency }} {{ gameSummary[game._id]?.winloss || "0.00" }}
              </td>
              <td class="px-6 py-4 text-sm max-md:px-3 max-md:py-2">
                <div
                  v-if="game.isHTMLGame || game.isManualGame"
                  class="flex justify-center gap-2 max-md:flex-col max-md:gap-1"
                >
                  <button
                    v-if="game.isManualGame"
                    @click="handleShowAccount(game)"
                    class="px-3 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-2 max-md:py-1 max-md:text-[10px]"
                  >
                    {{ $t("account") }}
                  </button>
                  <button
                    @click="handleTransferIn(game)"
                    class="px-3 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-2 max-md:py-1 max-md:text-[10px]"
                  >
                    {{ $t("transfer_in") }}
                  </button>
                  <button
                    @click="handleTransferOut(game)"
                    class="px-3 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-2 max-md:py-1 max-md:text-[10px]"
                  >
                    {{ $t("transfer_out") }}
                  </button>
                  <button
                    v-if="game.changePasswordApi"
                    @click="handleChangePassword(game)"
                    class="px-3 py-2 text-xs bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 max-md:px-2 max-md:py-1 max-md:text-[10px]"
                  >
                    {{ $t("change_password") }}
                  </button>
                </div>
                <div v-else class="text-gray-500 max-md:text-xs">Seamless</div>
              </td>
            </tr>
            <tr v-if="games.length === 0" class="h-[400px] max-md:h-[300px]">
              <td
                colspan="9"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:py-3"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  <span class="max-md:text-xs">{{
                    $t("no_records_found")
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-100">
            <tr>
              <td
                class="px-6 py-4 text-sm font-bold text-right max-md:px-3 max-md:py-2 max-md:text-xs"
                colspan="4"
              >
                {{ $t("total") }}:
              </td>
              <td
                class="px-6 py-4 text-sm font-bold max-md:px-3 max-md:py-2 max-md:text-xs"
              >
                {{ currency }} {{ totalTurnover }}
              </td>
              <td
                class="px-6 py-4 text-sm font-bold max-md:px-3 max-md:py-2 max-md:text-xs"
                :class="getWinLossClass(totalWinloss)"
              >
                {{ currency }} {{ totalWinloss }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <GameTransferOutModal
      v-model:show="showTransferOutModal"
      :balance="gameBalances[selectedGame?._id] || 0"
      :game="selectedGame"
      :user-id="userData._id"
      @success="handleTransferOutSuccess"
    />

    <GameTransferInModal
      v-model:show="showTransferInModal"
      :balance="gameBalances[selectedGameForTransferIn?._id] || 0"
      :game="selectedGameForTransferIn"
      :user-id="userData._id"
      @success="handleTransferInSuccess"
    />

    <GameAccountModal
      v-model:show="showAccountModal"
      :game="selectedGameForAccount"
      :userData="userData"
      @refresh="handleAccountModalRefresh"
      v-if="selectedGameForAccount"
    />

    <GameChangePasswordModal
      v-model:show="showChangePasswordModal"
      :game="selectedGameForPassword"
      :user-id="userData._id"
    />
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import moment from "moment-timezone";
const onSearchClick = () => {
  console.log("Search button clicked");
};

const totalTurnover = ref("0.00");
const totalWinloss = ref("0.00");

const dateRange = ref({
  startDate: null,
  endDate: null,
});

const props = defineProps({
  userData: {
    type: Object,
    required: true,
  },
  games: {
    type: Array,
    required: true,
  },
});
const showTransferInModal = ref(false);
const selectedGameForTransferIn = ref(null);
const categoryTotals = ref({});
const isTransferToMainButtonLoading = ref({});
const isTransferAllButtonLoading = ref(false);
const isCheckBalanceButtonLoading = ref(false);
const showAccountModal = ref(false);
const selectedGameForAccount = ref(null);
const showTransferOutModal = ref(false);
const selectedGame = ref(null);
const currency = useCurrency();
const { get, post } = useApiEndpoint();
const games = ref([]);
const gameBalances = ref({});
const isCheckingBalance = ref({});
const gameSummary = ref({});
const isPageLoading = ref(true);

const emit = defineEmits([
  "check-balance",
  "transfer-back",
  "toggle-transfer",
  "update",
]);

const isUpdatingGame = ref({});

// Add this method
const handleManualUpdate = async (game, action) => {
  if (!game.betId || !game.gameName) {
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: "Missing game information",
    });
    return;
  }

  try {
    const confirmResult = await Swal.fire({
      title: $t("confirm_action"),
      text: `${$t("confirm_manual_update")} ${action} ${$t("for_game")} ${
        game.gameName
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "settle" ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: $t("confirm"),
      cancelButtonText: $t("cancel"),
    });

    if (!confirmResult.isConfirmed) return;

    isUpdatingGame.value[game.betId] = action;

    const { data } = await post("games/manual-status-update", {
      gameName: game.gameName,
      betId: game.betId,
      action: action,
      reason: "Manual update from active games modal",
    });

    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("update_successful"),
        text: data.message[$locale.value] || data.message.en,
        timer: 2000,
      });

      await handleRefreshActiveGames();
    } else {
      throw new Error(
        data.message[$locale.value] || data.message.en || "Update failed"
      );
    }
  } catch (error) {
    console.error("Manual update error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("update_failed"),
      text: error.message || $t("update_failed_message"),
    });
  } finally {
    delete isUpdatingGame.value[game.betId];
  }
};

const getWinLossClass = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return "text-green-600";
  if (numValue < 0) return "text-red-600";
  return "text-gray-600";
};

const handleShowAccount = (game) => {
  selectedGameForAccount.value = game;
  showAccountModal.value = true;
};

const handleAccountModalRefresh = async () => {
  emit("update");
};

const handleTransferOut = (game) => {
  selectedGame.value = game;
  showTransferOutModal.value = true;
};

const handleTransferOutSuccess = async () => {
  if (selectedGame.value) {
    await checkGameBalance(selectedGame.value);
  }
};

const handleTransferInSuccess = async () => {
  if (selectedGameForTransferIn.value) {
    await checkGameBalance(selectedGameForTransferIn.value);
  }
};

const isFetchActiveGamesLoading = ref(false);
const activeGamesData = ref([]);
const showActiveGamesModal = ref(false);
const getTimeAgo = (dateString) => {
  if (!dateString) return "";
  try {
    return moment(dateString).tz("Asia/Kuala_Lumpur").fromNow();
  } catch (error) {
    return "";
  }
};

const handleRefreshActiveGames = async () => {
  await handleFetchActiveGames();
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    return moment(dateString)
      .tz("Asia/Kuala_Lumpur")
      .format("DD/MM/YYYY HH:mm:ss");
  } catch (error) {
    return dateString;
  }
};

const handleFetchActiveGames = async () => {
  isFetchActiveGamesLoading.value = true;
  try {
    const { data } = await post(
      `games/active-gamesdetail/${props.userData._id}`
    );

    if (data.success) {
      activeGamesData.value = data.activeGames || [];
      showActiveGamesModal.value = true;
    } else {
      await Swal.fire({
        icon: "error",
        title: $t("error"),
        text: data.message || $t("fetch_active_games_failed"),
      });
    }
  } catch (error) {
    console.error("Error fetching active games:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("fetch_active_games_failed"),
    });
  } finally {
    isFetchActiveGamesLoading.value = false;
  }
};

const handleTransferIn = (game) => {
  selectedGameForTransferIn.value = game;
  showTransferInModal.value = true;
};

const fetchGames = async () => {
  try {
    const { data } = await get("kiosks");
    if (data.success) {
      const uniqueGamesMap = new Map();
      const gamesWithAPI = data.data.filter((game) => game.todayKioskReportAPI);

      gamesWithAPI.forEach((game) => {
        const apiEndpoint = game.todayKioskReportAPI;
        if (!apiEndpoint) return;
        if (!uniqueGamesMap.has(apiEndpoint)) {
          uniqueGamesMap.set(apiEndpoint, {
            ...game,
            categories: [game.categoryId],
          });
        } else {
          const existingGame = uniqueGamesMap.get(apiEndpoint);
          const categoryExists = existingGame.categories.some(
            (cat) => cat._id === game.categoryId._id
          );
          if (!categoryExists) {
            existingGame.categories.push(game.categoryId);
          }
        }
      });
      games.value = Array.from(uniqueGamesMap.values());
      await checkAllGameBalances();
      await fetchGameSummary();
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    isPageLoading.value = false;
  }
};

const checkGameBalance = async (game) => {
  if (!game.adminCheckUserBalanceAPI) return;
  isCheckingBalance.value[game._id] = true;
  try {
    const balanceEndpoint = `${game.adminCheckUserBalanceAPI.replace(
      ":userId",
      props.userData._id
    )}`;
    const { data } = await post(balanceEndpoint);
    if (data.success) {
      gameBalances.value[game._id] = data.balance;
    }
  } catch (error) {
    console.error("Error checking balance for game:", game.name, error);
  } finally {
    isCheckingBalance.value[game._id] = false;
  }
};

const checkAllGameBalances = async () => {
  try {
    games.value.forEach((game) => {
      isCheckingBalance.value[game._id] = false;
    });
    await Promise.all(
      games.value.map(async (game) => {
        await checkGameBalance(game);
      })
    );
  } catch (error) {
    console.error("Error checking all game balances:", error);
  }
};

const handleCheckAllBalances = async () => {
  isCheckBalanceButtonLoading.value = true;
  await checkAllGameBalances();
  isCheckBalanceButtonLoading.value = false;
};

const handleCheckBalance = (gameId) => {
  emit("check-balance", gameId);
};

const handleTransferToMain = async (game) => {
  isTransferToMainButtonLoading.value[game._id] = true;
  try {
    if (!game.transferAllBalanceAPI) {
      console.error($t("missing_api_endpoint"));
      return;
    }
    const endpoint = game.transferAllBalanceAPI.replace(
      ":userId",
      props.userData._id
    );
    const { data } = await post(endpoint);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("transfer_successful"),
        text: $t("transfer_success_message_main"),
        timer: 1500,
      });
      await checkGameBalance(game);
    } else {
      await Swal.fire({
        icon: "info",
        title: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error transferring balance:", error);
    await Swal.fire({
      icon: "error",
      title: $t("transfer_failed"),
      text: error.message || $t("transfer_failed_message_main"),
    });
  } finally {
    isTransferToMainButtonLoading.value[game._id] = false;
  }
};

const handleTransferAllToMain = async () => {
  isTransferAllButtonLoading.value = true;
  try {
    const endpoint = `game/${props.userData._id}/transferout/all`;
    const { data } = await post(endpoint);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("transfer_successful"),
        text: $t("transfer_success_message_all"),
        timer: 1500,
      });
      await checkAllGameBalances();
    } else {
      await Swal.fire({
        icon: "info",
        title: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error transferring all balances:", error);
    await Swal.fire({
      icon: "error",
      title: $t("transfer_failed"),
      text: error.message || $t("transfer_failed_message_all"),
    });
  } finally {
    isTransferAllButtonLoading.value = false;
  }
};

const toggleLockTransferIn = async (game) => {
  try {
    let endpoint;
    if (game.isManualGame || game.isHTMLGame) {
      endpoint = `${game.databaseName}/transferstatus/transferinstatus/${props.userData._id}`;
    } else {
      // endpoint = game.lockGameAPI.replace(":userId", props.userData._id);
      endpoint = `${game.databaseName}/seamlessstatus/${props.userData._id}`;
    }
    const { data } = await post(endpoint);
    if (data.success) {
      game.transferInEnabled = !game.transferInEnabled;
      await Swal.fire({
        icon: "success",
        title: game.transferInEnabled
          ? $t("lock_transfer_in_enabled")
          : $t("lock_transfer_in_disabled"),
        timer: 1500,
      });
      emit("update");
    }
  } catch (error) {
    console.error("Error toggling lock transfer in:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("lock_transfer_in_failed"),
    });
  }
};

const toggleLockTransferOut = async (game) => {
  try {
    let endpoint;
    if (game.isManualGame || game.isHTMLGame) {
      endpoint = `${game.databaseName}/transferstatus/transferoutstatus/${props.userData._id}`;
    } else {
      endpoint = `${game.databaseName}/seamlessstatus/${props.userData._id}`;
    }

    const { data } = await post(endpoint);
    if (data.success) {
      game.transferOutEnabled = !game.transferOutEnabled;
      await Swal.fire({
        icon: "success",
        title: game.transferOutEnabled
          ? $t("lock_transfer_out_enabled")
          : $t("lock_transfer_out_disabled"),
        timer: 1500,
      });
    }
  } catch (error) {
    console.error("Error toggling lock transfer out:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: $t("lock_transfer_out_failed"),
    });
  }
};

const calculateTotals = () => {
  let turnoverSum = 0;
  let winlossSum = 0;
  const categoryTurnover = {};
  categoryTotals.value = {};
  for (const gameId in gameSummary.value) {
    const gameData = gameSummary.value[gameId];
    const game = games.value.find((g) => g._id === gameId);

    if (game && gameData) {
      const categoryName = game.categoryId?.name || "Unknown";
      const turnover = parseFloat(gameData.turnover || 0);
      const winloss = parseFloat(gameData.winloss || 0);
      turnoverSum += turnover;
      winlossSum += winloss;
      if (!categoryTurnover[categoryName]) {
        categoryTurnover[categoryName] = {
          turnover: 0,
          winloss: 0,
        };
      }
      categoryTurnover[categoryName].turnover += turnover;
      categoryTurnover[categoryName].winloss += winloss;
    }
  }
  totalTurnover.value = turnoverSum.toFixed(2);
  totalWinloss.value = winlossSum.toFixed(2);
  for (const categoryName in categoryTurnover) {
    categoryTotals.value[categoryName] = {
      turnover: categoryTurnover[categoryName].turnover.toFixed(2),
      winloss: categoryTurnover[categoryName].winloss.toFixed(2),
    };
  }
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    await Swal.fire({
      icon: "success",
      title: $t("copied"),
      text: text,
      timer: 1000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

// const fetchGameSummary = async () => {
//   console.log("开始执行 fetchGameSummary");
//   console.log("games.value 长度:", games.value?.length);
//   isPageLoading.value = true;
//   const params = new URLSearchParams();
//   if (dateRange.value.startDate) {
//     params.append("startDate", dateRange.value.startDate);
//   }
//   if (dateRange.value.endDate) {
//     params.append("endDate", dateRange.value.endDate);
//   }

//   try {
//     for (const game of games.value) {
//       try {
//         console.log(`\n开始处理游戏: ${game.name}`);
//         console.log("游戏ID:", game._id);

//         const isToday = moment(dateRange.value.startDate).isSame(
//           moment(),
//           "day"
//         );
//         console.log("是否为今天:", isToday);

//         if (
//           !game.todayTurnoverWinlossAPI &&
//           !game.yesterdayTurnoverWinlossAPI
//         ) {
//           console.warn(`游戏 ${game.name} 缺少必要的 API 配置，跳过处理`);
//           continue;
//         }

//         const apiEndpoint = isToday
//           ? game.todayTurnoverWinlossAPI
//           : game.yesterdayTurnoverWinlossAPI;

//         console.log("选择的 apiEndpoint:", apiEndpoint);

//         const baseEndpoint = apiEndpoint.replace(":userId", props.userData._id);
//         const endpoint = `${baseEndpoint}?${params.toString()}`;
//         console.log("最终请求的 endpoint:", endpoint);

//         console.log("开始发送请求...");
//         const { data } = await get(endpoint);
//         console.log("获得响应:", data);

//         if (data.success) {
//           gameSummary.value[game._id] = {
//             turnover: data.summary.user.turnover,
//             winloss: data.summary.user.winloss,
//           };
//           console.log(`游戏 ${game.name} 数据更新成功`);
//         } else {
//           console.warn(`游戏 ${game.name} 返回失败状态:`, data);
//         }
//       } catch (gameError) {
//         // 单个游戏的错误不会影响其他游戏的处理
//         console.error(`处理游戏 ${game.name} 时出错:`, {
//           error: gameError.message,
//           stack: gameError.stack,
//         });
//         continue;
//       }
//     }
//     console.log("所有游戏处理完成");
//   } catch (error) {
//     console.error("fetchGameSummary 整体执行出错:", error);
//   } finally {
//     calculateTotals();
//     isPageLoading.value = false;
//   }
// };

const fetchGameSummary = async () => {
  console.log("开始执行 fetchGameSummary");
  console.log("games.value 长度:", games.value?.length);
  isPageLoading.value = true;
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  try {
    const isToday = moment(dateRange.value.startDate).isSame(moment(), "day");
    console.log("是否为今天:", isToday);
    const gameRequests = games.value
      .filter(
        (game) =>
          game.todayTurnoverWinlossAPI && game.yesterdayTurnoverWinlossAPI
      )
      .map(async (game) => {
        try {
          console.log(`准备处理游戏: ${game.name}`);
          const apiEndpoint = isToday
            ? game.todayTurnoverWinlossAPI
            : game.yesterdayTurnoverWinlossAPI;
          const baseEndpoint = apiEndpoint.replace(
            ":userId",
            props.userData._id
          );
          const endpoint = `${baseEndpoint}?${params.toString()}`;
          console.log(`${game.name} 请求 endpoint:`, endpoint);
          const { data } = await get(endpoint);
          if (data.success) {
            return {
              gameId: game._id,
              gameName: game.name,
              data: {
                turnover: data.summary.user.turnover,
                winloss: data.summary.user.winloss,
              },
            };
          } else {
            console.warn(`游戏 ${game.name} 返回失败状态:`, data);
            return null;
          }
        } catch (error) {
          console.error(`游戏 ${game.name} 请求出错:`, error.message);
          return null;
        }
      });
    console.log(`开始并发请求 ${gameRequests.length} 个游戏数据...`);
    const results = await Promise.all(gameRequests);
    results.forEach((result) => {
      if (result) {
        gameSummary.value[result.gameId] = result.data;
        console.log(`游戏 ${result.gameName} 数据更新成功`);
      }
    });
    console.log("所有游戏数据获取完成");
  } catch (error) {
    console.error("fetchGameSummary Promise.all 执行出错:", error);
  } finally {
    calculateTotals();
    isPageLoading.value = false;
  }
};

watch(
  dateRange,
  () => {
    if (
      games.value?.length > 0 &&
      dateRange.value.startDate &&
      dateRange.value.endDate
    ) {
      fetchGameSummary();
    }
  },
  { deep: true }
);

const showChangePasswordModal = ref(false);
const selectedGameForPassword = ref(null);

const handleChangePassword = (game) => {
  selectedGameForPassword.value = game;
  showChangePasswordModal.value = true;
};

onMounted(async () => {
  const now = moment().tz("Asia/Kuala_Lumpur");
  dateRange.value = {
    startDate: now.clone().startOf("day").toDate(),
    endDate: now.clone().endOf("day").toDate(),
  };
  await fetchGames();
  isPageLoading.value = false;
});
</script>

<style scoped>
@keyframes popupIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes popupOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}

.animate-popupIn {
  animation: popupIn 0.3s ease-out forwards;
}

.animate-popupOut {
  animation: popupOut 0.3s ease-out forwards;
}
</style>
