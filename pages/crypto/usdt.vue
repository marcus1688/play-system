<template>
  <div>
    <PageLoading v-if="isPageLoading" />

    <CryptoPassword
      v-model:show="showPasswordModal"
      :is-loading="isPageLoading"
      @submit="validatePassword"
    />

    <CryptoDeactivateAccount
      v-model:show="showDeactivateAccountModal"
      :is-loading="isPageLoading"
      @submit="confirmDeactivateAccount"
    />

    <CryptoTransferTrx
      v-model:show="showTransferTrxModal"
      :private-key="transferTrxData.fromPrivateKey"
      :is-loading="isPageLoading"
      @submit="confirmTrxTransfer"
    />

    <CryptoInternalTransfer
      v-model:show="showTransferModal"
      :sender-account-id="transferData.senderAccountId"
      :is-loading="isPageLoading"
      @submit="transferFunds"
    />

    <CryptoExternalTransfer
      v-model:show="showExternalWithdrawModal"
      :private-key="externalWithdrawData.fromPrivateKey"
      :sender-account-id="externalWithdrawData.senderAccountId"
      :address="externalWithdrawData.address"
      :smart-contracts="smartContracts"
      :is-loading="isPageLoading"
      @submit="submitExternalWithdraw"
    />

    <CryptoInternalWithdraw
      v-model:show="showInternalWithdrawModal"
      :sender-account-id="internalWithdrawData.senderAccountId"
      :is-loading="isPageLoading"
      @submit="submitInternalWithdraw"
    />

    <CryptoTrc20Transaction
      v-model:show="showTrc20TransactionModal"
      :transactions="trc20Transactions"
      :account-address="accountAddress"
    />

    <CryptoTrxTransaction
      v-model:show="showTrxTransactionModal"
      :transactions="trxTransactions"
      :account-address="accountAddress"
    />
    <!-- Header Section -->
    <div class="flex items-center gap-4 mb-6 max-md:mb-4 max-md:gap-3">
      <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
      <h1
        class="text-2xl font-semibold text-gray-800 tracking-wide max-md:text-xl"
      >
        Crypto Bank
      </h1>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow mb-6 max-md:mb-4">
      <div class="mb-6 p-6 max-sm:mb-1 max-sm:p-4">
        <div class="flex justify-end items-center mb-2">
          <div
            class="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-300 rounded-md max-md:gap-1.5 max-md:p-1.5"
          >
            <div class="text-yellow-600">
              <Icon
                icon="heroicons:exclamation-triangle"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
            </div>
            <span class="text-xs text-yellow-700 max-md:text-[10px]">
              <span class="font-bold">CAUTION:</span> These batch operations
              will affect all accounts and may take significant time to
              complete. Use with extreme care.
            </span>
          </div>
        </div>
        <div
          class="flex flex-wrap sm:items-center justify-between mb-4 max-sm:flex-col"
        >
          <span class="text-red-500 font-bold text-xs max-sm:mb-2"
            >**This Page Only Support English**</span
          >
          <div class="flex gap-2 max-md:flex-wrap max-md:gap-1.5 max-md:w-full">
            <button
              @click="openPasswordModal"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 transition-colors hidden max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              Generate Tron Wallet
            </button>
            <button
              @click="openDeactivateAccountModal"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg lg:hover:bg-gray-500 transition-colors hidden max-md:px-3 max-md:py-1.5 max-md:text-sm"
            >
              Deactivate Account
            </button>
            <button
              @click="handleBatchProcess"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg lg:hover:bg-purple-500 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              Transfer All USDT
            </button>
            <button
              @click="handleRecoverTrx"
              class="px-4 py-2 bg-amber-600 text-white rounded-lg lg:hover:bg-amber-500 transition-colors max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
            >
              Recover All TRX
            </button>
          </div>
        </div>

        <!-- Account Summary Stats -->
        <div class="flex sm:items-center justify-between max-sm:flex-col">
          <div class="text-lg font-bold max-sm:hidden max-md:text-base">
            Admin Account
          </div>
          <div>
            <div class="flex gap-1 max-sm:justify-end">
              <img
                src="/images/crypto/money.png"
                alt="Money Icon"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
              <p class="text-sm max-md:text-xs">
                Total Account Balance: USDT {{ totalAccountBalance.toFixed(2) }}
              </p>
            </div>
            <div class="flex gap-1 max-sm:justify-end">
              <img
                src="/images/crypto/money.png"
                alt="Money Icon"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
              <p class="text-sm max-md:text-xs">
                Total Available Balance: USDT
                {{ totalAvailableBalance.toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Accounts Table -->
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap">
          <thead class="bg-gray-50 text-center">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                No
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Crypto ID
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Crypto Account
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Member
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Account Balance
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Available Balance
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Crypto Customer ID
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                <div
                  class="flex gap-2 items-center justify-center max-md:gap-1"
                >
                  Network Sync
                  <Icon
                    @click="refetchData"
                    icon="material-symbols:refresh"
                    class="w-4 h-4 cursor-pointer lg:hover:text-indigo-500 max-md:w-3 max-md:h-3"
                  />
                </div>
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 text-center text-sm">
            <tr
              v-for="(account, index) in adminAccountData"
              :key="account.id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                {{ index + 1 }}
              </td>
              <td
                class="px-6 py-4 max-w-[200px] break-words whitespace-normal max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span class="break-words whitespace-normal">{{
                  account.id
                }}</span>
              </td>
              <td
                class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="{
                  'text-green-500': account.accountCode === 'tron_account',
                  'text-blue-500': account.accountCode === 'eth_account',
                }"
              >
                <div class="flex justify-center">
                  <img
                    v-if="account.accountCode === 'tron_account'"
                    src="/images/crypto/tronicon.png"
                    alt="Tron Logo"
                    class="w-8 h-8 max-md:w-6 max-md:h-6"
                  />
                </div>
                TRC20
                <div
                  class="text-black break-words whitespace-normal max-w-[200px]"
                >
                  <span>
                    {{ findCryptoAddress(account.id) }}
                  </span>
                </div>
                <div class="text-black">
                  DerivationKey: {{ findDerivationKey(account.id) }}
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div class="flex items-center justify-center gap-1">
                  <Icon icon="mdi:user" class="w-4 h-4 max-md:w-3 max-md:h-3" />
                  {{ account.accountNumber || "N/A" }}
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="
                    account.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                  class="px-2 py-1 rounded text-xs font-medium uppercase"
                >
                  {{ account.active ? "Active" : "Deactivated" }}
                </span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div
                  class="flex items-center gap-2 justify-center max-md:gap-1"
                >
                  <img
                    src="/images/crypto/usdtlogo.png"
                    alt="USDT Logo"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  USDT {{ Number(account.balance.accountBalance).toFixed(2) }}
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div
                  class="flex items-center gap-2 justify-center max-md:gap-1"
                >
                  <img
                    src="/images/crypto/usdtlogo.png"
                    alt="USDT Logo"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  USDT {{ Number(account.balance.availableBalance).toFixed(2) }}
                </div>
              </td>
              <td
                class="px-6 py-4 max-w-[100px] break-words whitespace-normal max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span class="break-words whitespace-normal">{{
                  account.customerId
                }}</span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div v-if="account.accountCode === 'tron_account'">
                  <div
                    class="flex items-center gap-2 text-sm justify-center max-md:gap-1 max-md:text-xs"
                  >
                    <img
                      src="/images/crypto/usdtlogo.png"
                      alt="USDT Logo"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    USDT: {{ Number(adminTronBalance.usdtBalance).toFixed(2) }}
                  </div>
                  <div
                    class="flex items-center gap-2 text-sm justify-center max-md:gap-1 max-md:text-xs"
                  >
                    <img
                      src="/images/crypto/tronicon.png"
                      alt="TRX Logo"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    TRX: {{ Number(adminTronBalance.trxBalance).toFixed(2) }}
                  </div>
                </div>
                <div v-else>N/A</div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <CryptoButtonDropdown
                  :dropdown-id="`action-${account.id}`"
                  button-text="Actions"
                  :items="[
                    {
                      label: 'Transfer TRX',
                      action: () => openTransferTrxModal(account.id),
                      icon: 'heroicons:arrow-path',
                    },
                    {
                      label: 'Internal Transfer',
                      action: () => openTransferModal(account.id),
                      icon: 'heroicons:arrow-right-circle',
                    },
                    {
                      label: 'External Withdraw',
                      action: () => openExternalWithdrawModal(account.id),
                      icon: 'heroicons:arrow-up-tray',
                    },
                    {
                      label: 'Internal Withdraw',
                      action: () => initiateInternalWithdraw(account.id),
                      icon: 'heroicons:arrow-up-circle',
                    },
                    {
                      label: 'USDT Transaction',
                      action: () => fetchTrc20Transactions(account.id),
                      icon: 'heroicons:currency-dollar',
                    },
                    {
                      label: 'TRX Transaction',
                      action: () => fetchTrxTransactions(account.id),
                      icon: 'heroicons:banknotes',
                    },
                  ]"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Customer Accounts Section -->
    <div class="mt-8 max-md:mt-6">
      <div
        class="flex flex-wrap items-center justify-between mb-4 max-md:mb-3 max-md:gap-3"
      >
        <div class="flex items-center max-sm:hidden">
          <span class="mr-2 max-md:text-sm">Show</span>
          <select
            v-model="entriesPerPage"
            class="border rounded p-2 bg-white max-md:p-1.5 max-md:text-sm"
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span class="ml-2 max-md:text-sm">entries</span>
        </div>
        <h2 class="text-lg font-bold max-md:text-base">Member Account</h2>
        <div
          class="flex flex-wrap items-center gap-4 max-md:gap-2 max-md:w-full"
        >
          <div class="flex items-center max-md:w-full">
            <span class="mr-2 max-md:text-sm">Search:</span>
            <input
              v-model="nameInstantSearch"
              placeholder="Search..."
              type="text"
              class="border rounded p-2 max-md:p-1.5 max-md:text-sm max-md:flex-1"
            />
          </div>
        </div>
      </div>

      <!-- Customer Accounts Table -->
      <div class="overflow-x-auto">
        <table class="w-full whitespace-nowrap">
          <thead class="bg-gray-50 text-center">
            <tr>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                No
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Crypto ID
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Crypto Account
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Member
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer lg:hover:bg-indigo-100 max-md:px-3 max-md:py-2"
                @click="sort('accountBalance')"
              >
                <div
                  class="flex gap-2 items-center justify-center max-md:gap-1"
                >
                  Account Balance
                  <Icon icon="fa6-solid:sort" class="w-3 h-3 text-gray-300" />
                </div>
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer lg:hover:bg-indigo-100 max-md:px-3 max-md:py-2"
                @click="sort('availableBalance')"
              >
                <div
                  class="flex gap-2 items-center justify-center max-md:gap-1"
                >
                  Available Balance
                  <Icon icon="fa6-solid:sort" class="w-3 h-3 text-gray-300" />
                </div>
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Crypto Customer ID
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Network Sync
              </th>
              <th
                class="px-6 py-3 text-xs font-medium text-gray-500 uppercase max-md:px-3 max-md:py-2"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white text-center text-sm">
            <tr
              v-for="(account, index) in currentEntries"
              :key="account.id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                {{ index + 1 }}
              </td>
              <td
                class="px-6 py-4 max-w-[200px] break-words whitespace-normal max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span class="break-words whitespace-normal">{{
                  account.id
                }}</span>
              </td>
              <td
                class="px-6 py-4 max-w-[200px] max-md:px-3 max-md:py-3 max-md:text-xs"
                :class="{
                  'text-green-500': account.accountCode === 'tron_account',
                  'text-blue-500': account.accountCode === 'eth_account',
                }"
              >
                <div class="flex justify-center">
                  <img
                    v-if="account.accountCode === 'tron_account'"
                    src="/images/crypto/tronicon.png"
                    alt="Tron Logo"
                    class="w-8 h-8 max-md:w-6 max-md:h-6"
                  />
                </div>
                TRC20
                <div class="text-black break-words whitespace-normal">
                  {{ findCryptoAddress(account.id) }}
                </div>
                <div class="text-black">
                  DerivationKey: {{ findDerivationKey(account.id) }}
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div class="flex items-center justify-center gap-1">
                  <Icon icon="mdi:user" class="w-4 h-4 max-md:w-3 max-md:h-3" />
                  {{ account.accountNumber || "N/A" }}
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <span
                  :class="
                    account.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  "
                  class="px-2 py-1 rounded text-xs font-medium uppercase"
                >
                  {{ account.active ? "Active" : "Deactivated" }}
                </span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div
                  class="flex items-center gap-2 justify-center max-md:gap-1"
                >
                  <img
                    src="/images/crypto/usdtlogo.png"
                    alt="USDT Logo"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  USDT {{ Number(account.balance.accountBalance).toFixed(2) }}
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div
                  class="flex items-center gap-2 justify-center max-md:gap-1"
                >
                  <img
                    src="/images/crypto/usdtlogo.png"
                    alt="USDT Logo"
                    class="w-4 h-4 max-md:w-3 max-md:h-3"
                  />
                  USDT {{ Number(account.balance.availableBalance).toFixed(2) }}
                </div>
              </td>
              <td
                class="px-6 py-4 max-w-[200px] break-words whitespace-normal max-md:px-3 max-md:py-3 max-md:text-xs"
              >
                <span class="break-words whitespace-normal">
                  {{ account.customerId }}
                </span>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 max-md:text-xs">
                <div v-if="cryptoBalances[account.id]">
                  <div
                    class="flex items-center gap-2 text-sm justify-center max-md:gap-1 max-md:text-xs"
                  >
                    <img
                      src="/images/crypto/usdtlogo.png"
                      alt="USDT Logo"
                      class="w-4 h-4 max-md:w-3 max-md:h-3"
                    />
                    USDT:
                    {{
                      cryptoBalances[account.id].totalUsdt !== undefined
                        ? cryptoBalances[account.id].totalUsdt
                        : "Loading..."
                    }}
                  </div>
                  <div class="flex items-center gap-1 justify-center">
                    <div
                      class="flex items-center gap-2 text-sm max-md:gap-1 max-md:text-xs"
                    >
                      <img
                        src="/images/crypto/tronicon.png"
                        alt="TRX Logo"
                        class="w-4 h-4 max-md:w-3 max-md:h-3"
                      />
                      TRX:
                      {{
                        cryptoBalances[account.id].totalTrx !== undefined
                          ? cryptoBalances[account.id].totalTrx
                          : "Loading..."
                      }}
                    </div>
                    <div>
                      <Icon
                        @click="fetchCustomerCryptoBalance(account.id)"
                        icon="material-symbols:refresh"
                        class="w-4 h-4 cursor-pointer lg:hover:text-indigo-500 max-md:w-3 max-md:h-3"
                      />
                    </div>
                  </div>
                </div>
                <div v-else>
                  <button
                    @click="fetchCustomerCryptoBalance(account.id)"
                    class="bg-indigo-600 lg:hover:bg-indigo-500 text-white px-3 py-1 rounded text-sm max-md:px-2 max-md:py-2 max-md:text-xs"
                  >
                    Get Live Data
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <CryptoButtonUpward
                  :dropdown-id="`action-${account.id}`"
                  button-text="Actions"
                  :items="[
                    {
                      label: 'Transfer TRX',
                      action: () => openTransferTrxModal(account.id),
                      icon: 'heroicons:arrow-path',
                    },
                    {
                      label: 'Internal Transfer',
                      action: () => openTransferModal(account.id),
                      icon: 'heroicons:arrow-right-circle',
                    },
                    {
                      label: 'External Withdraw',
                      action: () => openExternalWithdrawModal(account.id),
                      icon: 'heroicons:arrow-up-tray',
                    },
                    {
                      label: 'Internal Withdraw',
                      action: () => initiateInternalWithdraw(account.id),
                      icon: 'heroicons:arrow-up-circle',
                    },
                    {
                      label: 'USDT Transaction',
                      action: () => fetchTrc20Transactions(account.id),
                      icon: 'heroicons:currency-dollar',
                    },
                    {
                      label: 'TRX Transaction',
                      action: () => fetchTrxTransactions(account.id),
                      icon: 'heroicons:banknotes',
                    },
                  ]"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        class="mt-4 flex justify-between items-center max-md:flex-col max-md:gap-3 max-md:items-stretch"
      >
        <div class="text-sm text-gray-600 max-md:text-xs max-md:text-center">
          Showing {{ (currentPage - 1) * entriesPerPage + 1 }} to
          {{ Math.min(currentPage * entriesPerPage, totalEntries) }} of
          {{ totalEntries }} entries
        </div>
        <div class="flex max-md:justify-center">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-gray-100 text-gray-600 rounded-l-md lg:hover:bg-gray-200 disabled:opacity-50 max-md:px-2"
          >
            <Icon
              icon="material-symbols:chevron-left"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
          <div v-for="page in pagesToShow" :key="page" class="px-1">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              class="px-3 py-1 rounded-md max-md:px-2 max-md:text-sm"
              :class="
                page === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 lg:hover:bg-gray-200'
              "
            >
              {{ page }}
            </button>
            <span v-else class="px-2 py-1 max-md:px-1 max-md:text-sm">...</span>
          </div>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-gray-100 text-gray-600 rounded-r-md lg:hover:bg-gray-200 disabled:opacity-50 max-md:px-2"
          >
            <Icon
              icon="material-symbols:chevron-right"
              class="w-5 h-5 max-md:w-4 max-md:h-4"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";

const { get, post } = useApiEndpoint();
const isPageLoading = ref(true);
const isButtonLoading = ref({});
const isPasswordModalOpen = ref(false);
const showPasswordModal = ref(false);
const showDeactivateAccountModal = ref(false);
const showTransferTrxModal = ref(false);
const showTransferModal = ref(false);
const showExternalWithdrawModal = ref(false);
const showInternalWithdrawModal = ref(false);
const showTrc20TransactionModal = ref(false);
const showTrxTransactionModal = ref(false);
const accountAddress = ref("");
const password = ref("");
const virtualAccountData = ref([]);
const filteredvirtualAccountData = ref([]);
const totalEntries = ref(0);
const entriesPerPage = ref(10);
const currentPage = ref(1);
const nameInstantSearch = ref("");
const totalVirtualAccountData = ref({});
const deactivateAccountId = ref("");
const allCryptoDetails = ref([]);
const adminAccountData = ref([]);
const adminTronBalance = ref([]);
const cryptoBalances = ref({});
const trc20Transactions = ref([]);
const trxTransactions = ref([]);
const smartContracts = ref([]);

const transferData = ref({
  senderAccountId: "",
  recipientAccountId: "",
  amount: "",
});

const internalWithdrawData = ref({
  senderAccountId: "",
  address: "",
  amount: "",
  fee: "50",
});

const transferTrxData = ref({
  fromPrivateKey: "",
  to: "",
  amount: "",
});

const externalWithdrawData = ref({
  fromPrivateKey: "",
  to: "",
  amount: "",
  tokenAddress: "",
  feeLimit: 20,
});

const sortState = ref({ column: null, ascending: true });

const totalAccountBalance = computed(() =>
  Array.isArray(totalVirtualAccountData.value)
    ? totalVirtualAccountData.value.reduce(
        (total, account) => total + Number(account.balance.accountBalance),
        0
      )
    : 0
);

const totalAvailableBalance = computed(() =>
  Array.isArray(totalVirtualAccountData.value)
    ? totalVirtualAccountData.value.reduce(
        (total, account) => total + Number(account.balance.availableBalance),
        0
      )
    : 0
);

const totalPages = computed(() => {
  return Math.ceil(totalEntries.value / entriesPerPage.value);
});

const currentEntries = computed(() => {
  const start = (currentPage.value - 1) * entriesPerPage.value;
  const end = start + entriesPerPage.value;
  return virtualAccountData.value.slice(start, end).map((item, index) => {
    return {
      ...item,
      adjustedIndex: start + index + 1,
    };
  });
});

const pagesToShow = computed(() => {
  let range = [];
  const total = totalPages.value;
  const current = currentPage.value;
  range.push(1);
  let start = Math.max(2, current - 2);
  let end = Math.min(total - 1, current + 2);
  if (start > 2) {
    range.push("...");
  }
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  if (end < total - 1) {
    range.push("...");
  }

  if (total > 1) {
    range.push(total);
  }
  return range;
});

const sort = (column) => {
  if (sortState.value.column === column) {
    sortState.value.ascending = !sortState.value.ascending;
  } else {
    sortState.value.column = column;
    sortState.value.ascending = true;
  }
  virtualAccountData.value.sort((a, b) => {
    let compare = 0;
    let aValue = a[column];
    let bValue = b[column];
    if (column === "accountBalance") {
      aValue = a.balance.accountBalance;
      bValue = b.balance.accountBalance;
    } else if (column === "availableBalance") {
      aValue = a.balance.availableBalance;
      bValue = b.balance.availableBalance;
    }

    if (aValue < bValue) compare = -1;
    if (aValue > bValue) compare = 1;

    if (!sortState.value.ascending) compare *= -1;

    return compare;
  });
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
  currentPage.value = Number(currentPage.value);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
  currentPage.value = Number(currentPage.value);
};

const goToPage = (page) => {
  if (page !== "...") {
    currentPage.value = Number(page);
  }
};

const filteredInstanceAccount = () => {
  if (nameInstantSearch.value) {
    virtualAccountData.value = filteredvirtualAccountData.value.filter(
      (account) => {
        const searchTerm = nameInstantSearch.value.toLowerCase();
        const matchesAccountName = account.accountNumber
          ?.toLowerCase()
          .includes(searchTerm);
        const address = findCryptoAddress(account.id);
        const matchesAddress = address?.toLowerCase().includes(searchTerm);
        return matchesAccountName || matchesAddress;
      }
    );
  } else {
    virtualAccountData.value = filteredvirtualAccountData.value;
  }
  totalEntries.value = virtualAccountData.value.length;
  currentPage.value = 1;
};

const fetchAllVirtualAccount = async () => {
  try {
    const { data } = await get("get-accounts");
    if (data) {
      totalVirtualAccountData.value = data;
      virtualAccountData.value = data.filter(
        (account) => account.accountNumber !== "marcus888"
      );
      filteredvirtualAccountData.value = [...virtualAccountData.value];
      totalEntries.value = virtualAccountData.value.length;
      adminAccountData.value = data.filter(
        (account) => account.accountNumber === "marcus888"
      );
    }
  } catch (error) {
    console.error("Fetch error:", error);
    Swal.fire({
      title: "Error!",
      text: "There was an issue fetching virtual account details, please try again.",
      icon: "error",
    });
  }
};

const fetchCryptoDetails = async () => {
  try {
    const { data } = await get("get-crypto-details");
    if (data) {
      allCryptoDetails.value = data;
    }
  } catch (error) {
    console.error("Error fetching crypto details:", error);
  }
};

const fetchAdminTronBalance = async () => {
  try {
    const { data } = await post("admin-trx-balance");
    if (data) {
      adminTronBalance.value = data;
    }
  } catch (error) {
    console.error("Error fetching Admin Tron Balance:", error);
  }
};

const fetchCustomerCryptoBalance = async (accountId) => {
  isPageLoading.value = true;
  const address = findCryptoAddress(accountId);
  if (!address) {
    cryptoBalances.value[accountId] = { totalTrx: 0, totalUsdt: 0 };
    isPageLoading.value = false;
    return;
  }

  try {
    const { data } = await post("customer-crypto-details", { address });
    if (data) {
      cryptoBalances.value[accountId] = {
        totalTrx: data.totalTrx,
        totalUsdt: data.totalUsdt,
      };
    }
  } catch (error) {
    console.error("Error fetching crypto balance:", error);
    cryptoBalances.value[accountId] = { totalTrx: 0, totalUsdt: 0 };
  } finally {
    isPageLoading.value = false;
  }
};

const refetchData = async () => {
  isPageLoading.value = true;
  try {
    await fetchAllVirtualAccount();
    await fetchCryptoDetails();
    await fetchAdminTronBalance();
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    isPageLoading.value = false;
  }
};

const findCryptoAddress = (accountId) => {
  for (const cryptoDetail of allCryptoDetails.value) {
    if (cryptoDetail.crypto_accountid === accountId) {
      return cryptoDetail.crypto_address;
    }
  }
  return null;
};

const findDerivationKey = (accountId) => {
  for (const cryptoDetail of allCryptoDetails.value) {
    if (cryptoDetail.crypto_accountid === accountId) {
      return cryptoDetail.index;
    }
  }
  return null;
};

const findCryptoPrivateKey = (accountId) => {
  for (const cryptoDetail of allCryptoDetails.value) {
    if (cryptoDetail.crypto_accountid === accountId) {
      return cryptoDetail.private_key;
    }
  }
  return null;
};

const openPasswordModal = () => {
  showPasswordModal.value = true;
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  password.value = "";
};

const validatePassword = (passwordInput) => {
  generateTronWallet(passwordInput);
};

const openDeactivateAccountModal = () => {
  showDeactivateAccountModal.value = true;
};

const closeDeactivateAccountModal = () => {
  showDeactivateAccountModal.value = false;
  deactivateAccountId.value = "";
};

const openTransferModal = (accountId) => {
  transferData.value.senderAccountId = accountId;
  showTransferModal.value = true;
};

const closeTransferModal = () => {
  showTransferModal.value = false;
  transferData.value = {
    senderAccountId: "",
    recipientAccountId: "",
    amount: "",
  };
};

const openTransferTrxModal = (accountId) => {
  const privateKey = findCryptoPrivateKey(accountId);
  transferTrxData.value.fromPrivateKey = privateKey;
  showTransferTrxModal.value = true;
};

const closeTransferTrxModal = () => {
  showTransferTrxModal.value = false;
  transferTrxData.value = {
    fromPrivateKey: "",
    to: "",
    amount: "",
  };
};

const initiateInternalWithdraw = (accountId) => {
  internalWithdrawData.value.senderAccountId = accountId;
  showInternalWithdrawModal.value = true;
};

const closeInternalWithdrawModal = () => {
  showInternalWithdrawModal.value = false;
  internalWithdrawData.value = {
    senderAccountId: "",
    address: "",
    amount: "",
    fee: "50",
  };
};

const openExternalWithdrawModal = async (accountId) => {
  isPageLoading.value = true;
  try {
    const address = findCryptoAddress(accountId);
    if (!address) throw new Error("Address not found");
    const privateKey = findCryptoPrivateKey(accountId);

    externalWithdrawData.value.senderAccountId = accountId;
    externalWithdrawData.value.address = address;
    externalWithdrawData.value.fromPrivateKey = privateKey;

    const { data } = await post("get-smart-contract", { address });
    if (data) {
      if (data.SmartContractDetails && data.SmartContractDetails.length > 0) {
        smartContracts.value = data.SmartContractDetails;
      } else {
        smartContracts.value = [{ smartContractAddress: "N/A", amount: 0 }];
      }
      showExternalWithdrawModal.value = true;
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message,
    });
  } finally {
    isPageLoading.value = false;
  }
};

const closeExternalWithdrawModal = () => {
  showExternalWithdrawModal.value = false;
  externalWithdrawData.value = {
    fromPrivateKey: "",
    to: "",
    amount: "",
    tokenAddress: "",
    feeLimit: 20,
  };
};

const generateTronWallet = async (passwordInput) => {
  isPageLoading.value = true;
  try {
    const { data } = await post("generate-tron-wallet", {
      password: passwordInput,
    });
    if (data) {
      Swal.fire({
        icon: "success",
        title: "Tron Wallet Generated",
        html: `<p>Mnemonic: ${data.mnemonic}</p>
              <p>xpub: ${data.xpub}</p>`,
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error generating Tron wallet: " + error.message,
    });
  } finally {
    isPageLoading.value = false;
    closePasswordModal();
  }
};

const confirmDeactivateAccount = async (accountId) => {
  if (!accountId) {
    Swal.fire("Error", "Please enter a valid account ID", "error");
    return;
  }

  isPageLoading.value = true;
  try {
    const { data } = await post("crypto-deactivate-account", { accountId });
    if (data) {
      Swal.fire("Success", "Account deactivated successfully", "success");
      refetchData();
    }
  } catch (error) {
    Swal.fire("Error", error.message || "An error occurred", "error");
  } finally {
    isPageLoading.value = false;
    closeDeactivateAccountModal();
  }
};

const transferFunds = async (formData) => {
  isPageLoading.value = true;
  try {
    const { data } = await post("internal-transfer-funds", formData);
    if (data) {
      Swal.fire({
        icon: "success",
        title: "Transfer Successful",
        text: "The funds have been transferred successfully.",
      });
      refetchData();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Transfer Failed",
      text: error.message || "Transfer failed",
    });
  } finally {
    isPageLoading.value = false;
    closeTransferModal();
  }
};

const confirmTrxTransfer = async (formData) => {
  isPageLoading.value = true;
  try {
    const { data } = await post("tranfer-trx", formData);
    if (data) {
      Swal.fire(
        "Transaction Successful!",
        "Your transaction was successful.",
        "success"
      );
      refetchData();
    }
  } catch (error) {
    Swal.fire(
      "Transaction Failed",
      error.message || "Transaction failed.",
      "error"
    );
  } finally {
    isPageLoading.value = false;
    closeTransferTrxModal();
  }
};

const submitInternalWithdraw = async (formData) => {
  isPageLoading.value = true;
  try {
    const { data } = await post("internal-withdraw", formData);
    if (data) {
      Swal.fire({
        icon: "success",
        title: "Withdrawal Successful",
        text: "The withdrawal has been processed successfully.",
      });
      refetchData();
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Withdrawal Failed",
      text: error.message || "An error occurred during the withdrawal process.",
    });
  } finally {
    isPageLoading.value = false;
    closeInternalWithdrawModal();
  }
};

const submitExternalWithdraw = async (formData) => {
  const result = await Swal.fire({
    title: "Confirm Withdrawal",
    text: "Please ensure that your account has at least 20 TRX for transaction fees. Do you want to continue?",
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancel",
    confirmButtonText: "Yes, proceed",
    reverseButtons: false,
  });

  if (result.isConfirmed) {
    isPageLoading.value = true;
    try {
      const { data } = await post("external-withdraw", formData);
      if (data) {
        Swal.fire({
          icon: "success",
          title: "Withdrawal Successful",
          text: "Transaction completed successfully",
        });
        refetchData();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Withdrawal Failed",
        text: error.message,
      });
    } finally {
      isPageLoading.value = false;
      closeExternalWithdrawModal();
    }
  }
};

const fetchTrc20Transactions = async (accountId) => {
  isPageLoading.value = true;
  const address = findCryptoAddress(accountId);
  accountAddress.value = address;

  if (!address) {
    Swal.fire("Error", "No address found for this account", "error");
    isPageLoading.value = false;
    return;
  }

  try {
    const { data } = await post("trc20-transactions", { address });
    if (data) {
      trc20Transactions.value = data.transactions;
      showTrc20TransactionModal.value = true;
    }
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
  } finally {
    isPageLoading.value = false;
  }
};

const closeTrc20TransactionModal = () => {
  showTrc20TransactionModal.value = false;
};

const fetchTrxTransactions = async (accountId) => {
  isPageLoading.value = true;
  const address = findCryptoAddress(accountId);
  accountAddress.value = address;

  if (!address) {
    Swal.fire("Error", "No address found for this account", "error");
    isPageLoading.value = false;
    return;
  }

  try {
    const { data } = await post("trx-transactions", { address });
    if (data) {
      trxTransactions.value = data.transactions;
      showTrxTransactionModal.value = true;
    }
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
  } finally {
    isPageLoading.value = false;
  }
};

const closeTrxTransactionModal = () => {
  showTrxTransactionModal.value = false;
};

const handleBatchProcess = async () => {
  const result = await Swal.fire({
    title: "Transfer All USDT",
    html: "This operation will transfer TRX to all accounts and then collect all USDT back to main account.<br><br><b>This process will take a significant amount of time to complete.</b><br><br>Do you want to continue?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#9333ea",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, proceed",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    isPageLoading.value = true;
    try {
      const { data } = await post("batch-process-accounts", {});
      if (data) {
        Swal.fire({
          icon: "success",
          title: "Process Completed",
          html: `
            <p>Successfully processed ${data.accountsProcessed} accounts.</p>
            <p>TRX Transfers: ${data.trxTransfers.successful} successful, ${data.trxTransfers.failed} failed</p>
            <p>USDT Transfers: ${data.usdtTransfers.successful} successful, ${data.usdtTransfers.failed} failed</p>
          `,
        });
      }
    } catch (error) {
      let errorMessage = error.message || "An error occurred";
      if (
        error.response?.data?.error ===
        "Insufficient TRX balance in admin account"
      ) {
        const { required, available, deficit } = error.response.data;
        errorMessage = `Insufficient TRX balance in admin account.<br>Required: ${required.toFixed(
          2
        )} TRX<br>Available: ${available.toFixed(
          2
        )} TRX<br>Deficit: ${deficit.toFixed(2)} TRX`;
      }

      Swal.fire({
        icon: "error",
        title: "Process Failed",
        html: errorMessage,
      });
    } finally {
      isPageLoading.value = false;
    }
  }
};

const handleRecoverTrx = async () => {
  const result = await Swal.fire({
    title: "Recover All TRX",
    html: "This operation will collect all TRX from user accounts back to the main account.<br><br><b>This process will take a significant amount of time to complete.</b><br><br>Do you want to continue?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d97706",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, proceed",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    isPageLoading.value = true;
    try {
      const { data } = await post("recover-trx-balances", {});

      if (data) {
        Swal.fire({
          icon: "success",
          title: "Recovery Completed",
          html: `
            <p>Total accounts processed: ${data.totalAccounts}</p>
            <p>Successfully recovered: ${data.successful} accounts</p>
            <p>Skipped: ${data.skipped} accounts</p>
            <p>Failed: ${data.failed} accounts</p>
            <p>Total recovered TRX: ${data.totalRecoveredTrx}</p>
          `,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Recovery Failed",
        html: error.message || "An error occurred",
      });
    } finally {
      isPageLoading.value = false;
    }
  }
};

watch(nameInstantSearch, () => {
  filteredInstanceAccount();
});

watch(entriesPerPage, (newVal) => {
  entriesPerPage.value = Number(newVal);
  currentPage.value = 1;
});

onMounted(async () => {
  try {
    await fetchAllVirtualAccount();
    await fetchCryptoDetails();
    await fetchAdminTronBalance();
  } catch (error) {
    console.error("Error during data fetch", error);
  } finally {
    isPageLoading.value = false;
  }
});

useHead({
  title: "Money System | Crypto Bank",
});
</script>
