<template>
  <Teleport to="body"
    ><div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-2"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[80%] max-h-[90vh] my-6 flex flex-col max-md:w-full max-md:my-3"
      >
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between max-md:gap-2">
            <div
              class="flex items-center gap-4 max-md:gap-2 max-md:flex-1 max-md:min-w-0"
            >
              <div
                class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6 max-md:flex-shrink-0"
              ></div>
              <div class="max-md:min-w-0">
                <h2
                  class="text-xl font-semibold max-md:text-base max-md:truncate"
                >
                  {{ $t("unlimited_rebate_details") }}
                </h2>
                <p class="text-sm text-gray-500 max-md:text-xs max-md:truncate">
                  {{ reportData?.username || "-" }}
                </p>
              </div>
            </div>
            <button
              @click="$emit('update:show', false)"
              class="text-gray-500 lg:hover:text-gray-700 max-md:flex-shrink-0"
            >
              <Icon
                icon="material-symbols:close"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
            </button>
          </div>
        </div>

        <div class="border-b px-6 max-md:px-3">
          <nav
            class="flex gap-6 whitespace-nowrap overflow-x-auto pb-4 max-md:gap-3 max-md:pb-3"
          >
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="[
                'py-4 relative font-medium max-md:py-2 max-md:text-sm',
                activeTab === tab.value
                  ? 'text-indigo-600'
                  : 'text-gray-500 lg:hover:text-gray-700',
              ]"
            >
              {{ $i18n.locale === "zh" ? tab.labelCN : tab.label }}
              <div
                v-if="activeTab === tab.value"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
              ></div>
            </button>
          </nav>
        </div>

        <div class="p-6 overflow-y-auto h-[90vh] max-md:p-3 max-md:h-[70vh]">
          <div
            v-if="activeTab === 'basic'"
            class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
          >
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 border-b max-md:p-3">
                <div class="flex items-center gap-4 max-md:gap-2">
                  <div
                    class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                  ></div>
                  <h3 class="text-lg font-semibold max-md:text-base">
                    {{ $t("report_information") }}
                  </h3>
                </div>
              </div>

              <div
                class="p-6 grid grid-cols-3 gap-6 text-left max-md:p-3 max-md:grid-cols-1 max-md:gap-3"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("username") }}</label
                  >
                  <div class="text-sm max-md:text-xs">
                    {{ reportData?.username || "-" }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("report_id") }}</label
                  >
                  <div
                    class="text-sm font-mono rounded max-md:text-xs max-md:break-all"
                  >
                    {{ reportData?._id || "-" }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("status") }}</label
                  >
                  <div class="text-sm max-md:text-xs">
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs max-md:text-[10px]',
                        reportData?.processed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{
                        reportData?.processed ? $t("processed") : $t("pending")
                      }}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("total_commission") }}</label
                  >
                  <div class="text-sm font-bold text-green-600 max-md:text-xs">
                    {{ currency }}
                    {{ reportData?.totalCommission?.toFixed(2) || "0.00" }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("total_turnover") }}</label
                  >
                  <div class="text-sm font-bold text-blue-600 max-md:text-xs">
                    {{ currency }}
                    {{ reportData?.grandTotalTurnover?.toFixed(2) || "0.00" }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("total_games") }}</label
                  >
                  <div class="text-sm max-md:text-xs">
                    {{ getTotalGamesCount() }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("time_called") }}</label
                  >
                  <div class="text-sm max-md:text-xs">
                    {{
                      reportData?.timeCalled
                        ? formatDate(reportData.timeCalled)
                        : "-"
                    }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("created_at") }}</label
                  >
                  <div class="text-sm max-md:text-xs">
                    {{
                      reportData?.createdAt
                        ? formatDate(reportData.createdAt)
                        : "-"
                    }}
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("updated_at") }}</label
                  >
                  <div class="text-sm max-md:text-xs">
                    {{
                      reportData?.updatedAt
                        ? formatDate(reportData.updatedAt)
                        : "-"
                    }}
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow text-left">
              <div class="p-4 border-b max-md:p-3">
                <div class="flex items-center gap-4 max-md:gap-2">
                  <div
                    class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                  ></div>
                  <h3 class="text-lg font-semibold max-md:text-base">
                    {{ $t("calculation_details") }}
                  </h3>
                </div>
              </div>

              <div class="p-6 space-y-4 max-md:p-3 max-md:space-y-3">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("formula") }}</label
                  >
                  <div class="rounded-lg">
                    <code class="text-sm max-md:text-xs max-md:break-all">{{
                      reportData?.formula || "-"
                    }}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'live'"
            class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
          >
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 border-b max-md:p-3">
                <div
                  class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2"
                >
                  <div class="flex items-center gap-4 max-md:gap-2">
                    <div
                      class="w-2 h-8 bg-red-500 rounded-full max-md:h-6"
                    ></div>
                    <h3 class="text-lg font-semibold max-md:text-base">
                      {{ $t("live_games") }}
                    </h3>
                  </div>
                  <div class="text-right max-md:text-left max-md:w-full">
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ $t("total_turnover") }}
                    </div>
                    <div
                      class="text-lg font-bold text-red-600 max-md:text-base"
                    >
                      {{ currency }} {{ getLiveTotalTurnover().toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 max-md:p-3">
                <div
                  v-if="reportData?.live?.games?.length > 0"
                  class="space-y-4 max-md:space-y-3"
                >
                  <div
                    v-for="(game, index) in reportData.live.games"
                    :key="index"
                    class="grid grid-cols-2 gap-6 p-4 border border-red-200 rounded-lg bg-red-50 max-md:grid-cols-1 max-md:gap-3 max-md:p-3"
                  >
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                        >{{ $t("game_name") }}</label
                      >
                      <div class="text-sm font-medium max-md:text-xs">
                        {{ game.gameName }}
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                        >{{ $t("turnover") }}</label
                      >
                      <div
                        class="text-sm font-bold text-green-600 max-md:text-xs"
                      >
                        {{ currency }}
                        {{ game.totalTurnover?.toFixed(2) || "0.00" }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-16 max-md:py-8">
                  <Icon
                    icon="material-symbols:hourglass-empty"
                    class="w-16 h-16 text-gray-300 mx-auto mb-4 max-md:w-12 max-md:h-12 max-md:mb-2"
                  />
                  <p class="text-lg text-gray-500 max-md:text-sm">
                    {{ $t("no_live_games") }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'sports'"
            class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
          >
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 border-b max-md:p-3">
                <div
                  class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2"
                >
                  <div class="flex items-center gap-4 max-md:gap-2">
                    <div
                      class="w-2 h-8 bg-blue-500 rounded-full max-md:h-6"
                    ></div>
                    <h3 class="text-lg font-semibold max-md:text-base">
                      {{ $t("sports_games") }}
                    </h3>
                  </div>
                  <div class="text-right max-md:text-left max-md:w-full">
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ $t("total_turnover") }}
                    </div>
                    <div
                      class="text-lg font-bold text-blue-600 max-md:text-base"
                    >
                      {{ currency }} {{ getSportsTotalTurnover().toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 max-md:p-3">
                <div
                  v-if="reportData?.sports?.games?.length > 0"
                  class="space-y-4 max-md:space-y-3"
                >
                  <div
                    v-for="(game, index) in reportData.sports.games"
                    :key="index"
                    class="grid grid-cols-2 gap-6 p-4 border border-blue-200 rounded-lg bg-blue-50 max-md:grid-cols-1 max-md:gap-3 max-md:p-3"
                  >
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                        >{{ $t("game_name") }}</label
                      >
                      <div class="text-sm font-medium max-md:text-xs">
                        {{ game.gameName }}
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                        >{{ $t("turnover") }}</label
                      >
                      <div
                        class="text-sm font-bold text-green-600 max-md:text-xs"
                      >
                        {{ currency }}
                        {{ game.totalTurnover?.toFixed(2) || "0.00" }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-16 max-md:py-8">
                  <Icon
                    icon="material-symbols:hourglass-empty"
                    class="w-16 h-16 text-gray-300 mx-auto mb-4 max-md:w-12 max-md:h-12 max-md:mb-2"
                  />
                  <p class="text-lg text-gray-500 max-md:text-sm">
                    {{ $t("no_sports_games") }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'others'"
            class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
          >
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 border-b max-md:p-3">
                <div
                  class="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2"
                >
                  <div class="flex items-center gap-4 max-md:gap-2">
                    <div
                      class="w-2 h-8 bg-purple-500 rounded-full max-md:h-6"
                    ></div>
                    <h3 class="text-lg font-semibold max-md:text-base">
                      {{ $t("other_games") }}
                    </h3>
                  </div>
                  <div class="text-right max-md:text-left max-md:w-full">
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ $t("total_turnover") }}
                    </div>
                    <div
                      class="text-lg font-bold text-purple-600 max-md:text-base"
                    >
                      {{ currency }} {{ getOthersTotalTurnover().toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 max-md:p-3">
                <div
                  v-if="reportData?.others?.games?.length > 0"
                  class="space-y-4 max-md:space-y-3"
                >
                  <div
                    v-for="(game, index) in reportData.others.games"
                    :key="index"
                    class="grid grid-cols-2 gap-6 p-4 border border-purple-200 rounded-lg bg-purple-50 max-md:grid-cols-1 max-md:gap-3 max-md:p-3"
                  >
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                        >{{ $t("game_name") }}</label
                      >
                      <div class="text-sm font-medium max-md:text-xs">
                        {{ game.gameName }}
                      </div>
                    </div>
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                        >{{ $t("turnover") }}</label
                      >
                      <div
                        class="text-sm font-bold text-green-600 max-md:text-xs"
                      >
                        {{ currency }}
                        {{ game.totalTurnover?.toFixed(2) || "0.00" }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-16 max-md:py-8">
                  <Icon
                    icon="material-symbols:hourglass-empty"
                    class="w-16 h-16 text-gray-300 mx-auto mb-4 max-md:w-12 max-md:h-12 max-md:mb-2"
                  />
                  <p class="text-lg text-gray-500 max-md:text-sm">
                    {{ $t("no_other_games") }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="activeTab === 'summary'"
            class="flex flex-col gap-4 min-w-[500px] overflow-x-auto max-md:min-w-0 max-md:gap-3"
          >
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 border-b max-md:p-3">
                <div class="flex items-center gap-4 max-md:gap-2">
                  <div
                    class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                  ></div>
                  <h3 class="text-lg font-semibold max-md:text-base">
                    {{ $t("games_summary") }}
                  </h3>
                </div>
              </div>

              <div
                class="p-6 grid grid-cols-3 gap-6 text-left max-md:p-3 max-md:grid-cols-1 max-md:gap-3"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("live_games") }}</label
                  >
                  <div class="space-y-1">
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ $t("games_count") }}:
                      {{ reportData?.live?.games?.length || 0 }}
                    </div>
                    <div
                      class="text-lg font-bold text-red-600 max-md:text-base"
                    >
                      {{ currency }} {{ getLiveTotalTurnover().toFixed(2) }}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("sports_games") }}</label
                  >
                  <div class="space-y-1">
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ $t("games_count") }}:
                      {{ reportData?.sports?.games?.length || 0 }}
                    </div>
                    <div
                      class="text-lg font-bold text-blue-600 max-md:text-base"
                    >
                      {{ currency }} {{ getSportsTotalTurnover().toFixed(2) }}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("other_games") }}</label
                  >
                  <div class="space-y-1">
                    <div class="text-sm text-gray-600 max-md:text-xs">
                      {{ $t("games_count") }}:
                      {{ reportData?.others?.games?.length || 0 }}
                    </div>
                    <div
                      class="text-lg font-bold text-purple-600 max-md:text-base"
                    >
                      {{ currency }} {{ getOthersTotalTurnover().toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow text-left">
              <div class="p-4 border-b max-md:p-3">
                <div class="flex items-center gap-4 max-md:gap-2">
                  <div
                    class="w-2 h-8 bg-indigo-400 rounded-full max-md:h-6"
                  ></div>
                  <h3 class="text-lg font-semibold max-md:text-base">
                    {{ $t("grand_total") }}
                  </h3>
                </div>
              </div>

              <div
                class="p-6 grid grid-cols-2 gap-6 max-md:p-3 max-md:grid-cols-1 max-md:gap-3"
              >
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("total_turnover") }}</label
                  >
                  <div
                    class="text-2xl font-bold text-indigo-600 max-md:text-lg"
                  >
                    {{ currency }}
                    {{ reportData?.grandTotalTurnover?.toFixed(2) || "0.00" }}
                  </div>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 mb-1 max-md:text-xs"
                    >{{ $t("total_commission") }}</label
                  >
                  <div class="text-2xl font-bold text-green-600 max-md:text-lg">
                    {{ currency }}
                    {{ reportData?.totalCommission?.toFixed(2) || "0.00" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div></Teleport
  >
</template>

<script setup>
import { Icon } from "@iconify/vue";
import { formatDate } from "~/utils/dateFormatter";

const props = defineProps({
  show: Boolean,
  reportData: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const currency = useCurrency();
const activeTab = ref("basic");

const tabs = [
  { label: "Basic Info", labelCN: "基本信息", value: "basic" },
  { label: "Live Games", labelCN: "真人游戏", value: "live" },
  { label: "Sports Games", labelCN: "体育游戏", value: "sports" },
  { label: "Other Games", labelCN: "其他游戏", value: "others" },
  { label: "Summary", labelCN: "汇总", value: "summary" },
];

const getLiveTotalTurnover = () => {
  if (!props.reportData?.live?.games) return 0;
  return props.reportData.live.games.reduce(
    (total, game) => total + (game.totalTurnover || 0),
    0
  );
};

const getSportsTotalTurnover = () => {
  if (!props.reportData?.sports?.games) return 0;
  return props.reportData.sports.games.reduce(
    (total, game) => total + (game.totalTurnover || 0),
    0
  );
};

const getOthersTotalTurnover = () => {
  if (!props.reportData?.others?.games) return 0;
  return props.reportData.others.games.reduce(
    (total, game) => total + (game.totalTurnover || 0),
    0
  );
};

const getTotalGamesCount = () => {
  const live = props.reportData?.live?.games?.length || 0;
  const sports = props.reportData?.sports?.games?.length || 0;
  const others = props.reportData?.others?.games?.length || 0;
  return live + sports + others;
};

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = "basic";
    }
  }
);
</script>
