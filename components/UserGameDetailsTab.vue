<template>
  <div
    class="space-y-6 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:space-y-4"
  >
    <PageLoading v-if="isPageLoading" />
    <!-- Quick Actions -->

    <div class="flex gap-4 max-md:flex-col max-md:gap-2">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showActiveGamesModal"
          class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 max-md:p-2"
          @click.self="showActiveGamesModal = false"
        >
          <div
            v-if="showActiveGamesModal"
            class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-popupIn"
          >
            <div
              class="border-b border-gray-200 px-6 py-4 max-md:px-4 max-md:py-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 max-md:gap-2">
                  <div
                    class="w-2 h-6 bg-indigo-600 rounded-full max-md:h-5"
                  ></div>
                  <h3 class="text-xl font-semibold max-md:text-base">
                    {{ $t("active_games") }}
                  </h3>
                  <span
                    class="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full max-md:text-xs max-md:px-1.5 max-md:py-2"
                  >
                    {{ activeGamesData.length }}
                  </span>
                </div>
                <button
                  @click="showActiveGamesModal = false"
                  class="text-gray-400 lg:hover:text-gray-600 transition-colors"
                >
                  <Icon
                    icon="material-symbols:close"
                    class="w-5 h-5 max-md:w-4 max-md:h-4"
                  />
                </button>
              </div>
            </div>

            <div class="p-6 max-md:p-4">
              <div
                v-if="activeGamesData.length === 0"
                class="text-center py-12 max-md:py-8"
              >
                <div
                  class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center max-md:w-12 max-md:h-12 max-md:mb-3"
                >
                  <Icon
                    icon="material-symbols:check"
                    class="w-8 h-8 text-gray-400 max-md:w-6 max-md:h-6"
                  />
                </div>
                <h4
                  class="text-lg font-medium text-gray-900 mb-2 max-md:text-base max-md:mb-1"
                >
                  {{ $t("no_active_games") }}
                </h4>
                <p class="text-gray-500 text-sm max-md:text-xs">
                  {{ $t("no_active_games_message") }}
                </p>
              </div>

              <div
                v-else
                class="space-y-3 max-h-96 overflow-y-auto max-md:space-y-2 max-md:max-h-80"
              >
                <TransitionGroup
                  enter-active-class="transition-all duration-500 ease-out"
                  leave-active-class="transition-all duration-200 ease-in"
                  enter-from-class="opacity-0 scale-95 translate-y-4"
                  enter-to-class="opacity-100 scale-100 translate-y-0"
                  leave-from-class="opacity-100 scale-100 translate-y-0"
                  leave-to-class="opacity-0 scale-95 -translate-y-4"
                >
                  <div
                    v-for="(game, index) in activeGamesData"
                    :key="game.betId || index"
                    class="border border-gray-200 rounded-lg p-4 lg:hover:bg-gray-50 transition-colors max-md:p-3"
                    :style="{ transitionDelay: `${index * 80}ms` }"
                  >
                    <div
                      class="flex items-center justify-between mb-3 max-md:mb-2"
                    >
                      <h5
                        class="font-medium text-gray-900 truncate pr-4 max-md:text-sm"
                      >
                        {{ game.gameName || $t("unknown_game") }}
                      </h5>
                    </div>

                    <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm max-md:gap-3 max-md:text-xs"
                    >
                      <div>
                        <span class="text-gray-500 block mb-1">{{
                          $t("bet_id")
                        }}</span>
                        <span class="font-mono text-gray-900 break-all">{{
                          game.betId || "-"
                        }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500 block mb-1">{{
                          $t("created_at")
                        }}</span>
                        <div>
                          <span class="text-gray-900">{{
                            formatDateTime(game.createdAt) || "-"
                          }}</span>
                          <div
                            class="text-xs text-gray-400 mt-1 max-md:text-[10px]"
                          >
                            {{ getTimeAgo(game.createdAt) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="mt-4 pt-3 border-t border-gray-100 max-md:mt-3 max-md:pt-2"
                    >
                      <div class="flex gap-2 justify-end">
                        <button
                          @click="handleManualUpdate(game, 'settle')"
                          :disabled="isUpdatingGame[game.betId]"
                          class="px-3 py-1.5 text-xs bg-green-600 text-white rounded lg:hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 max-md:px-2 max-md:py-1 max-md:text-[10px]"
                        >
                          <Icon
                            icon="material-symbols:check"
                            class="w-3 h-3 max-md:w-2.5 max-md:h-2.5"
                            :class="{
                              'animate-spin':
                                isUpdatingGame[game.betId] === 'settle',
                            }"
                          />
                          {{ $t("settle") }}
                        </button>
                        <button
                          @click="handleManualUpdate(game, 'cancel')"
                          :disabled="isUpdatingGame[game.betId]"
                          class="px-3 py-1.5 text-xs bg-red-600 text-white rounded lg:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 border border-red-700 shadow-sm lg:hover:shadow-md max-md:px-2 max-md:py-1 max-md:text-[10px]"
                        >
                          <Icon
                            icon="material-symbols:cancel-outline"
                            class="w-3 h-3 max-md:w-2.5 max-md:h-2.5"
                            :class="{
                              'animate-spin':
                                isUpdatingGame[game.betId] === 'cancel',
                            }"
                          />
                          {{ $t("void_bet") }}
                        </button>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>

            <!-- Footer -->
            <div
              class="border-t border-gray-200 px-6 py-4 bg-gray-50 max-md:px-4 max-md:py-3"
            >
              <div class="flex gap-3 justify-end max-md:gap-2 max-md:flex-col">
                <button
                  @click="handleRefreshActiveGames"
                  :disabled="isFetchActiveGamesLoading"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md lg:hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:justify-center"
                >
                  <Icon
                    icon="material-symbols:refresh"
                    class="w-4 h-4 transition-transform max-md:w-3 max-md:h-3"
                    :class="{ 'animate-spin': isFetchActiveGamesLoading }"
                  />
                  {{ $t("refresh") }}
                </button>
                <button
                  @click="showActiveGamesModal = false"
                  class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md lg:hover:bg-indigo-500 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-xs"
                >
                  {{ $t("close") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <LoadingButton
        :loading="isCheckBalanceButtonLoading"
        @click="handleCheckAllBalances"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:justify-center"
      >
        <div class="flex justify-center items-center gap-2">
          <Icon
            icon="material-symbols:account-balance"
            class="max-md:w-4 max-md:h-4"
          />
          <span class="max-md:text-xs">{{
            $t("check_all_game_balances")
          }}</span>
        </div>
      </LoadingButton>
      <LoadingButton
        :loading="isTransferAllButtonLoading"
        @click="handleTransferAllToMain"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:justify-center"
      >
        <div class="flex justify-center items-center gap-2">
          <Icon
            icon="material-symbols:move-to-inbox"
            class="max-md:w-4 max-md:h-4"
          />
          <span class="max-md:text-xs">{{
            $t("transfer_all_to_main_wallet")
          }}</span>
        </div>
      </LoadingButton>
      <LoadingButton
        :loading="isFetchActiveGamesLoading"
        @click="handleFetchActiveGames"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 flex items-center gap-2 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:justify-center"
      >
        <div class="flex justify-center items-center gap-2">
          <Icon
            icon="material-symbols:sports-esports"
            class="max-md:w-4 max-md:h-4"
          />
          <span class="max-md:text-xs">{{ $t("fetch_active_games") }}</span>
        </div>
      </LoadingButton>
    </div>

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
                {{ $t("lock_transfer_in") }}
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
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
              <td class="px-6 py-4 max-md:px-3 max-md:py-2">
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
              <td class="px-6 py-4 max-md:px-3 max-md:py-2">
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
                colspan="8"
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
                colspan="5"
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
      <div
        class="bg-white rounded-lg shadow mt-6 max-md:mt-4"
        v-if="Object.keys(categoryTotals).length > 0"
      >
        <div class="p-4 border-b max-md:p-3">
          <div class="flex items-center gap-4 max-md:gap-2">
            <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
            <h3 class="text-lg font-semibold max-md:text-base">
              {{ $t("category_summary") }}
            </h3>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full whitespace-nowrap text-center">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2 max-md:text-[10px]"
                >
                  {{ $t("game_category") }}
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
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(totals, categoryName) in categoryTotals"
                :key="categoryName"
                class="lg:hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 text-sm font-medium max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ categoryName }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                >
                  {{ currency }} {{ totals.turnover }}
                </td>
                <td
                  class="px-6 py-4 text-sm max-md:px-3 max-md:py-2 max-md:text-xs"
                  :class="getWinLossClass(totals.winloss)"
                >
                  {{ currency }} {{ totals.winloss }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <GameTransferOutModal
      v-model:show="showTransferOutModal"
      :balance="gameBalances[selectedGame?._id] || 0"
      :game="selectedGame"
      :user-id="userData._id"
      @success="handleTransferOutSuccess"
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
