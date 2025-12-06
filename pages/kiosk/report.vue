<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6 max-md:mb-4">
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
            {{ $t("kiosk_report") }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div
        class="flex items-end gap-3 justify-between p-4 border-b max-md:p-3 max-md:flex-col max-md:items-stretch"
      >
        <div class="flex items-center gap-2 max-md:w-full">
          <GameDetailsDatePicker
            v-model="dateRange.startDate"
            :placeholder="$t('start_date')"
            :is-start-date="true"
            :other-date="dateRange.endDate"
            @update:otherDate="dateRange.endDate = null"
          />
          <span class="text-gray-500 max-md:text-sm">-</span>
          <GameDetailsDatePicker
            v-model="dateRange.endDate"
            :placeholder="$t('end_date')"
            :is-start-date="false"
            :other-date="dateRange.startDate"
          />
        </div>
        <div
          class="flex flex-col gap-2 items-center max-md:flex-col max-md:w-full max-md:items-stretch"
        >
          <div class="flex items-center gap-4 max-md:w-full">
            <BaseSearch
              v-model="searchQuery"
              :placeholder="$t('search_game')"
              @type-change="handleTypeChange"
            />
          </div>
          <div class="flex max-md:flex-col gap-2 items-center">
            <button
              v-if="
                adminUserData?.role === 'superadmin' ||
                adminUserData?.role === 'admin'
              "
              @click="handleExport"
              :disabled="isExporting || filteredGames.length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg lg:hover:bg-green-500 flex items-center gap-2 justify-center max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              <Icon
                :icon="
                  isExporting
                    ? 'eos-icons:loading'
                    : 'material-symbols:download'
                "
                class="max-md:w-4 max-md:h-4"
              />
              {{ $t("export_to_excel") }}
            </button>
            <div class="flex justify-end gap-4 max-md:gap-2 max-md:w-full">
              <template v-if="isCurrentDay">
                <button
                  v-if="isTimerActive"
                  class="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
                  disabled
                >
                  {{ $t("refresh") }} ({{ formatTime(remainingTime) }})
                </button>
                <button
                  v-else
                  @click="fetchKioskReport"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
                >
                  {{ $t("refresh") }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-center whitespace-nowrap">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider max-md:px-3 max-md:py-2"
                :class="{
                  'cursor-pointer lg:hover:bg-gray-100': header.sortable,
                }"
                @click="handleSort(header.key)"
              >
                <div class="flex items-center gap-1 justify-center">
                  {{ $i18n.locale === "zh" ? header.labelCN : header.label }}
                  <div v-if="header.sortable">
                    <Icon
                      :icon="
                        sortConfig.key === header.key
                          ? sortConfig.direction === 'asc'
                            ? 'material-symbols:arrow-upward'
                            : 'material-symbols:arrow-downward'
                          : 'material-symbols:unfold-more'
                      "
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="game in paginatedGames"
              :key="game._id"
              class="lg:hover:bg-gray-50"
            >
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ game.no }}
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ game.name }}
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <img
                  :src="game.logo"
                  :alt="game.name"
                  class="h-auto w-24 mx-auto max-md:w-16"
                />
              </td>
              <td
                class="px-6 py-4 text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ game.category || "-" }}
              </td>
              <td
                class="px-6 py-4 text-center text-sm text-gray-600 max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                {{ currency }} {{ game.turnover || "0.00" }}
              </td>
              <td
                class="px-6 py-4 text-center text-sm max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="getWinLossClass(game.winLoss || 0)"
              >
                {{ currency }} {{ game.winLoss || "0.00" }}
              </td>
            </tr>
            <tr
              v-if="paginatedGames.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="6"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_records_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <BasePagination
        v-if="paginatedGames.length !== 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import moment from "moment-timezone";
import { formatDate } from "~/utils/dateFormatter";

const adminUserData = useState("adminUserData");
const { isExporting, exportToExcel } = useExportExcel();
const isPageLoading = ref(true);
const currency = useCurrency();
const { get } = useApiEndpoint();
const remainingTime = ref(0);
const isTimerActive = ref(false);
let timerInterval = null;
const tableHeaders = [
  { key: "no", label: "No", labelCN: "序号" },
  { key: "gameName", label: "Game Name", labelCN: "游戏名称" },
  { key: "gameLogo", label: "Game Logo", labelCN: "游戏标志" },
  { key: "category", label: "Category", labelCN: "游戏类别" },
  { key: "turnover", label: "Turnover", labelCN: "营业额", sortable: true },
  {
    key: "winLoss",
    label: "Total Company Win/Loss",
    labelCN: "公司总盈亏",
    sortable: true,
  },
];

const sortConfig = ref({
  key: "no",
  direction: "asc",
});
const handleSort = (key) => {
  if (!tableHeaders.find((h) => h.key === key).sortable) return;

  if (sortConfig.value.key === key) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = "asc";
  }
};
const isInitializing = ref(true);
const games = ref([]);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);

const totalPages = computed(() =>
  Math.ceil(filteredGames.value.length / itemsPerPage.value)
);

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredGames.value.slice(start, end).map((games, index) => ({
    ...games,
    no: start + index + 1,
  }));
});

const handleTypeChange = () => {
  currentPage.value = 1;
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
          uniqueGamesMap.set(apiEndpoint, game);
        }
      });
      games.value = Array.from(uniqueGamesMap.values());
    }
  } catch (error) {
    console.error("Error fetching games:", error);
    isPageLoading.value = false;
  }
};

// const fetchKioskReport = async () => {
//   isPageLoading.value = true;
//   const params = new URLSearchParams();
//   if (dateRange.value.startDate) {
//     params.append("startDate", dateRange.value.startDate);
//   }
//   if (dateRange.value.endDate) {
//     params.append("endDate", dateRange.value.endDate);
//   }
//   const isToday = moment(dateRange.value.startDate).isSame(moment(), "day");
//   if (isToday) {
//     const { canCall, remainingSeconds } = canCallTodayReport();
//     if (!canCall) {
//       if (!isInitializing.value) {
//         startTimer(remainingSeconds);
//       }
//       const cachedData = getCachedReportData();
//       if (cachedData) {
//         games.value = cachedData.games;
//         isPageLoading.value = false;
//         await Swal.fire({
//           icon: "info",
//           title: $t("using_cached_data"),
//           text: $t("cached_data_message"),
//           showConfirmButton: true,
//           timer: 2000,
//         });
//         return;
//       } else {
//         isPageLoading.value = false;
//         await Swal.fire({
//           icon: "info",
//           title: $t("call_limit_reached"),
//           text: $t("today_report_call_limit_message"),
//           showConfirmButton: true,
//         });
//         return;
//       }
//     }
//   }

//   try {
//     for (const game of games.value) {
//       try {
//         if (!game.todayKioskReportAPI && !game.yesterdayKioskReportAPI) {
//           console.warn(`游戏 ${game.name} 缺少必要的 API 配置，跳过处理`);
//           continue;
//         }
//         const apiEndpoint = isToday
//           ? game.todayKioskReportAPI
//           : game.yesterdayKioskReportAPI;
//         const endpoint = `${apiEndpoint}?${params.toString()}`;
//         const { data } = await get(endpoint);
//         if (data.success) {
//           const index = games.value.findIndex((g) => g._id === game._id);
//           if (index !== -1) {
//             games.value[index] = {
//               ...games.value[index],
//               turnover: data.summary.totalturnover || "0.00",
//               winLoss: data.summary.totalwinloss || "0.00",
//               category: data.summary.gamecategory || "",
//             };
//           }
//         }
//       } catch (error) {
//         console.error(`Error fetching report for game ${game.name}:`, error);
//       }
//     }
//     if (isToday) {
//       saveReportDataToLocalStorage(games.value);
//       updateLastCallTime();
//     }
//   } catch (error) {
//     console.error("Error fetching kiosk reports:", error);
//     await Swal.fire({
//       icon: "error",
//       title: $t("error"),
//       text: error.message,
//     });
//   } finally {
//     games.value = games.value.map((game, index) => ({
//       ...game,
//       no: index + 1,
//     }));
//     if (isToday) {
//       const { canCall, remainingSeconds } = canCallTodayReport();
//       if (!canCall) {
//         startTimer(remainingSeconds);
//       }
//     }
//     isPageLoading.value = false;
//   }
// };

const fetchKioskReport = async () => {
  isPageLoading.value = true;
  const params = new URLSearchParams();
  if (dateRange.value.startDate) {
    params.append("startDate", dateRange.value.startDate);
  }
  if (dateRange.value.endDate) {
    params.append("endDate", dateRange.value.endDate);
  }
  const isToday = moment(dateRange.value.startDate).isSame(moment(), "day");
  if (isToday) {
    const { canCall, remainingSeconds } = canCallTodayReport();
    if (!canCall) {
      if (!isInitializing.value) {
        startTimer(remainingSeconds);
      }
      const cachedData = getCachedReportData();
      if (cachedData) {
        games.value = cachedData.games;
        isPageLoading.value = false;
        await Swal.fire({
          icon: "info",
          title: $t("using_cached_data"),
          text: $t("cached_data_message"),
          showConfirmButton: true,
          timer: 2000,
        });
        return;
      } else {
        isPageLoading.value = false;
        await Swal.fire({
          icon: "info",
          title: $t("call_limit_reached"),
          text: $t("today_report_call_limit_message"),
          showConfirmButton: true,
        });
        return;
      }
    }
  }

  try {
    const gameRequests = games.value
      .filter(
        (game) => game.todayKioskReportAPI && game.yesterdayKioskReportAPI
      )
      .map(async (game) => {
        try {
          console.log(`开始处理游戏: ${game.name}`);
          const apiEndpoint = isToday
            ? game.todayKioskReportAPI
            : game.yesterdayKioskReportAPI;
          const endpoint = `${apiEndpoint}?${params.toString()}`;
          console.log(`${game.name} 请求 endpoint:`, endpoint);
          const { data } = await get(endpoint);
          if (data.success) {
            return {
              gameId: game._id,
              gameName: game.name,
              data: {
                turnover: data.summary.totalturnover || "0.00",
                winLoss: data.summary.totalwinloss || "0.00",
                category: data.summary.gamecategory || "",
              },
            };
          } else {
            console.warn(`游戏 ${game.name} 返回失败状态:`, data);
            return {
              gameId: game._id,
              gameName: game.name,
              data: {
                turnover: "0.00",
                winLoss: "0.00",
                category: "",
              },
            };
          }
        } catch (error) {
          console.error(`Error fetching report for game ${game.name}:`, error);
          return {
            gameId: game._id,
            gameName: game.name,
            data: {
              turnover: "0.00",
              winLoss: "0.00",
              category: "",
            },
          };
        }
      });
    console.log(`开始并发请求 ${gameRequests.length} 个游戏报表...`);
    const results = await Promise.all(gameRequests);
    results.forEach((result) => {
      const index = games.value.findIndex((g) => g._id === result.gameId);
      if (index !== -1) {
        games.value[index] = {
          ...games.value[index],
          ...result.data,
        };
        console.log(`游戏 ${result.gameName} 数据更新成功`);
      }
    });
    if (isToday) {
      saveReportDataToLocalStorage(games.value);
      updateLastCallTime();
    }

    console.log("所有游戏报表获取完成");
  } catch (error) {
    console.error("Error fetching kiosk reports:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text: error.message,
    });
  } finally {
    games.value = games.value.map((game, index) => ({
      ...game,
      no: index + 1,
    }));
    if (isToday) {
      const { canCall, remainingSeconds } = canCallTodayReport();
      if (!canCall) {
        startTimer(remainingSeconds);
      }
    }
    isPageLoading.value = false;
  }
};

const filteredGames = computed(() => {
  let filtered = [...games.value];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter((game) =>
      game.name.toLowerCase().includes(searchTerm)
    );
  }
  if (sortConfig.value.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.value.key];
      let bVal = b[sortConfig.value.key];
      if (typeof aVal === "string" && !isNaN(aVal)) aVal = parseFloat(aVal);
      if (typeof bVal === "string" && !isNaN(bVal)) bVal = parseFloat(bVal);
      const direction = sortConfig.value.direction === "asc" ? 1 : -1;
      if (aVal === bVal) return 0;
      if (aVal == null && bVal != null) return direction;
      if (aVal != null && bVal == null) return -direction;
      return aVal > bVal ? direction : -direction;
    });
  }
  return filtered;
});

const getWinLossClass = (value) => {
  const numValue = parseFloat(value);
  if (numValue > 0) return "text-green-600";
  if (numValue < 0) return "text-red-600";
  return "text-gray-600";
};

const canCallTodayReport = () => {
  const lastCallTime = localStorage.getItem("lastTodayReportCallTime");
  if (!lastCallTime) return { canCall: true, remainingSeconds: 0 };
  const now = Date.now();
  const lastCall = parseInt(lastCallTime);
  const timeDiff = now - lastCall;
  const intervalMs = 30000;
  if (timeDiff > intervalMs) {
    return { canCall: true, remainingSeconds: 0 };
  } else {
    const remainingMs = intervalMs - timeDiff;
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return { canCall: false, remainingSeconds };
  }
};

const updateLastCallTime = () => {
  localStorage.setItem("lastTodayReportCallTime", Date.now().toString());
};

const saveReportDataToLocalStorage = (data) => {
  try {
    localStorage.setItem(
      "cachedKioskReportData",
      JSON.stringify({
        timestamp: Date.now(),
        games: data,
      })
    );
  } catch (error) {
    console.error("Error saving report data to localStorage:", error);
  }
};

const getCachedReportData = () => {
  try {
    const cached = localStorage.getItem("cachedKioskReportData");
    if (!cached) return null;

    return JSON.parse(cached);
  } catch (error) {
    console.error("Error reading cached report data:", error);
    return null;
  }
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const startTimer = (seconds) => {
  remainingTime.value = seconds;
  isTimerActive.value = true;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime.value -= 1;
    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      isTimerActive.value = false;
    }
  }, 1000);
};

const stopTimer = () => {
  clearInterval(timerInterval);
  isTimerActive.value = false;
};

const isCurrentDay = computed(() => {
  return moment(dateRange.value.startDate).isSame(moment(), "day");
});

const handleExport = async () => {
  try {
    const hasExportPermission =
      adminUserData.value?.role === "superadmin" ||
      adminUserData.value?.role === "admin";
    if (!hasExportPermission) {
      Swal.fire({
        icon: "error",
        title: $t("permission_denied"),
        text: $t("export_permission_required"),
      });
      return;
    }
    if (filteredGames.value.length === 0) {
      Swal.fire({
        icon: "info",
        title: $t("no_data"),
        text: $t("no_data_to_export"),
      });
      return;
    }
    const exportData = filteredGames.value.map((game, index) => ({
      no: index + 1,
      name: game.name,
      category: game.category || "-",
      turnover: game.turnover || "0.00",
      winLoss: game.winLoss || "0.00",
    }));
    const totals = exportData.reduce(
      (acc, game) => ({
        turnover: acc.turnover + parseFloat(game.turnover || 0),
        winLoss: acc.winLoss + parseFloat(game.winLoss || 0),
      }),
      { turnover: 0, winLoss: 0 }
    );
    exportData.push({
      no: "",
      name: $t("total"),
      category: "",
      turnover: totals.turnover.toFixed(2),
      winLoss: totals.winLoss.toFixed(2),
    });
    let filename = "kiosk_report";
    if (dateRange.value.startDate && dateRange.value.endDate) {
      const startDateStr = moment(dateRange.value.startDate).format(
        "YYYY-MM-DD"
      );
      const endDateStr = moment(dateRange.value.endDate).format("YYYY-MM-DD");
      filename += `_${startDateStr}_to_${endDateStr}`;
    }
    const result = await exportToExcel({
      data: exportData,
      filename,
      sheetName: $t("kiosk_report"),
      columns: {
        no: { header: $t("no"), width: 8 },
        name: { header: $t("game_name"), width: 25 },
        category: { header: $t("category"), width: 15 },
        turnover: { header: $t("turnover"), width: 15 },
        winLoss: { header: $t("total_company_win_loss"), width: 25 },
      },
      formatter: (value, key) => {
        const moneyFields = ["turnover", "winLoss"];

        if (
          moneyFields.includes(key) &&
          (typeof value === "number" || !isNaN(parseFloat(value)))
        ) {
          const numValue =
            typeof value === "number" ? value : parseFloat(value);
          return numValue.toFixed(2);
        }

        return value;
      },
      beforeExport: () => {},
      afterExport: (success) => {
        if (success) {
          Swal.fire({
            icon: "success",
            title: $t("export_success"),
            text: $t("file_downloaded_successfully"),
            timer: 1500,
          });
        }
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    Swal.fire({
      icon: "error",
      title: $t("export_failed"),
      text: error.message,
    });
  }
};

watch(
  dateRange,
  () => {
    if (isInitializing.value) return;
    if (dateRange.value.startDate && dateRange.value.endDate) {
      currentPage.value = 1;
      fetchKioskReport();
    }
  },
  { deep: true }
);

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchGames();
  const now = moment().tz("Asia/Kuala_Lumpur");
  dateRange.value = {
    startDate: now.clone().startOf("day").toDate(),
    endDate: now.clone().endOf("day").toDate(),
  };
  await fetchKioskReport();
  const isToday = moment(dateRange.value.startDate).isSame(moment(), "day");
  if (isToday) {
    const { canCall, remainingSeconds } = canCallTodayReport();
    if (!canCall) {
      startTimer(remainingSeconds);
    }
  }
  isInitializing.value = false;
});

useHead({
  title: "Play System | Kiosk Report",
});
</script>
