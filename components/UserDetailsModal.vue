<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-2"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[80%] max-h-[90vh] my-6 flex flex-col max-md:w-full max-md:my-3"
      >
        <!-- Modal Header -->
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
                  {{ $t("user_details") }}
                </h2>
                <!-- <p class="text-sm text-gray-500 max-md:text-xs max-md:truncate">{{ username }}</p> -->
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

        <!-- Tabs Navigation -->
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

        <!-- Tab Content -->
        <div class="p-6 overflow-y-auto h-[90vh] max-md:p-3 max-md:h-[70vh]">
          <!-- User Details Tab -->
          <UserDetailsTab
            v-if="activeTab === 'details' && props.userData"
            :user="props.userData"
            @update="() => emit('userUpdated')"
          />

          <!-- Bank Details Tab -->
          <UserBankDetailsTab
            v-if="activeTab === 'bank'"
            :banks="userData.bankAccounts"
            :userId="userData._id"
            :userData="props.userData"
            @update="() => emit('userUpdated')"
          />

          <!-- Performance Tab -->
          <UserPerformanceTab
            v-if="activeTab === 'performance'"
            :userData="props.userData"
            @update="() => emit('userUpdated')"
          />

          <!-- Game Details Tab -->
          <UserGameDetailsTab
            v-if="activeTab === 'games'"
            :games="userGames"
            :userData="props.userData"
            @update="() => emit('userUpdated')"
          />

          <!-- Agent Downline Tab -->
          <UserAgentDownlineTab
            v-if="activeTab === 'agent-downline'"
            :userId="userData._id"
            :userData="props.userData"
            @update="() => emit('userUpdated')"
          />

          <!-- Transfer Logs Tab -->
          <UserTransferLogsTab
            v-if="activeTab === 'transfer-logs'"
            :userId="userData._id"
            :userData="props.userData"
          />

          <!-- Wallet Logs Tab -->
          <UserWalletLogsTab
            v-if="activeTab === 'wallet-logs'"
            :userId="userData._id"
          />

          <!-- Deposit Logs Tab -->
          <UserDepositLogsTab
            v-if="activeTab === 'deposit-logs'"
            :userId="userData._id"
          />

          <!-- Withdraw Logs Tab -->
          <UserWithdrawLogsTab
            v-if="activeTab === 'withdraw-logs'"
            :userId="userData._id"
          />

          <!-- Bonus Logs Tab -->
          <UserBonusLogsTab
            v-if="activeTab === 'bonus-logs'"
            :userId="userData._id"
          />
        </div>
      </div></div
  ></Teleport>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { get } = useApiEndpoint();
const props = defineProps({
  show: Boolean,
  userData: {
    type: Object,
    required: false,
    default: () => ({}),
  },
  defaultTab: {
    type: String,
    default: "details",
  },
});

watch(
  () => props.userId,
  (newId) => {
    if (newId) {
      userData.value = { ...mockUserData, id: newId };
    }
  },
  { immediate: true }
);

const emit = defineEmits(["update:show", "userUpdated"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const activeTab = ref(props.defaultTab);

const tabs = [
  { label: "User Details", labelCN: "用户详情", value: "details" },
  { label: "Bank Details", labelCN: "银行详情", value: "bank" },
  { label: "Performance", labelCN: "表现", value: "performance" },
  { label: "Game Details", labelCN: "游戏详情", value: "games" },
  { label: "Agent Downline", labelCN: "代理下线", value: "agent-downline" },
  { label: "Transfer Logs", labelCN: "钱包转账记录", value: "transfer-logs" },
  {
    label: "Wallet Logs",
    labelCN: "钱包记录",
    value: "wallet-logs",
  },
  { label: "Deposit Logs", labelCN: "存款记录", value: "deposit-logs" },
  { label: "Withdraw Logs", labelCN: "提款记录", value: "withdraw-logs" },
  { label: "Bonus Logs", labelCN: "奖金记录", value: "bonus-logs" },
];

const userGames = ref([
  {
    id: 1,
    name: "Game A",
    balance: "1500.00",
    transferInEnabled: true,
    transferOutEnabled: false,
    turnover: "5000.00",
    winLoss: "200.00",
  },
  {
    id: 2,
    name: "Game B",
    balance: "2300.00",
    transferInEnabled: false,
    transferOutEnabled: true,
    turnover: "7500.00",
    winLoss: "-350.00",
  },
  {
    id: 3,
    name: "Game C",
    balance: "800.00",
    transferInEnabled: true,
    transferOutEnabled: false,
    turnover: "3500.00",
    winLoss: "0.00",
  },
  {
    id: 4,
    name: "Game D",
    balance: "1200.00",
    transferInEnabled: true,
    transferOutEnabled: true,
    turnover: "6200.00",
    winLoss: "400.00",
  },
  {
    id: 5,
    name: "Game E",
    balance: "500.00",
    transferInEnabled: false,
    transferOutEnabled: false,
    turnover: "1500.00",
    winLoss: "-100.00",
  },
]);

watch(
  () => props.defaultTab,
  (newTab) => {
    if (newTab) {
      activeTab.value = newTab;
    }
  }
);

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = props.defaultTab;
    }
  }
);
</script>
