<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 custom-modal p-4 max-md:p-2"
      @pointerdown.self="onBackdropDown"
      @pointerup.self="onBackdropUp"
    >
      <div
        class="bg-white rounded-lg w-[80%] max-h-[90vh] my-6 flex flex-col min-h-[700px] max-w-full max-md:w-full max-md:my-2 max-md:min-h-[600px]"
      >
        <!-- Modal Header -->
        <div class="p-6 border-b max-md:p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 max-md:gap-3">
              <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
              <div>
                <h2 class="text-xl font-semibold max-md:text-base">
                  {{ $t("fingerprint_details") }}
                </h2>
                <p class="text-sm text-gray-500 max-md:text-xs">
                  {{ fingerprintData?.username || "-" }}
                </p>
              </div>
            </div>
            <button
              @click="$emit('update:show', false)"
              class="text-gray-500 lg:hover:text-gray-700 flex-shrink-0"
            >
              <Icon
                icon="material-symbols:close"
                class="w-6 h-6 max-md:w-5 max-md:h-5"
              />
            </button>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="border-b px-6 max-md:px-4">
          <nav
            class="flex gap-6 whitespace-nowrap overflow-x-auto pb-4 max-md:gap-4"
          >
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="activeTab = tab.value"
              :class="[
                'py-4 relative font-medium max-md:text-sm max-md:py-3',
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
        <div class="p-6 overflow-y-auto flex-1 max-md:p-4">
          <!-- Basic Info Tab -->
          <div v-if="activeTab === 'basic'" class="space-y-6 max-md:space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:gap-4">
              <!-- User Information -->
              <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
                <h3
                  class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
                >
                  {{ $t("user_information") }}
                </h3>
                <div class="space-y-2 max-md:space-y-1.5">
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("username") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.username || "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("user_id") }}:</span>
                    <span class="font-medium break-all">{{
                      fingerprintData?.userId?._id || "-"
                    }}</span>
                  </div>
                  <div
                    v-if="fingerprintData?.userInfo"
                    class="space-y-2 max-md:space-y-1.5"
                  >
                    <div class="flex justify-between max-md:text-sm">
                      <span class="text-gray-600">{{ $t("full_name") }}:</span>
                      <span class="font-medium">{{
                        fingerprintData.userInfo.fullname || "-"
                      }}</span>
                    </div>
                    <div class="flex justify-between max-md:text-sm">
                      <span class="text-gray-600">{{ $t("email") }}:</span>
                      <span class="font-medium break-all">{{
                        fingerprintData.userInfo.email || "-"
                      }}</span>
                    </div>
                    <div class="flex justify-between max-md:text-sm">
                      <span class="text-gray-600">{{ $t("status") }}:</span>
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs',
                          fingerprintData.userInfo.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800',
                        ]"
                      >
                        {{
                          fingerprintData.userInfo.status
                            ? $t("active")
                            : $t("inactive")
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fingerprint Basic Info -->
              <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
                <h3
                  class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
                >
                  {{ $t("fingerprint_info") }}
                </h3>
                <div class="space-y-2 max-md:space-y-1.5">
                  <div
                    class="flex justify-between max-md:flex-col max-md:gap-1"
                  >
                    <span class="text-gray-600 max-md:text-sm"
                      >{{ $t("visitor_id") }}:</span
                    >
                    <span
                      class="font-mono text-xs bg-gray-200 px-2 py-1 rounded break-all"
                      >{{ fingerprintData?.visitorId || "-" }}</span
                    >
                  </div>
                  <div
                    class="flex justify-between max-md:flex-col max-md:gap-1"
                  >
                    <span class="text-gray-600 max-md:text-sm"
                      >{{ $t("request_id") }}:</span
                    >
                    <span class="font-mono text-xs break-all">{{
                      fingerprintData?.requestId || "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600"
                      >{{ $t("visitor_found") }}:</span
                    >
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs',
                        fingerprintData?.visitorFound
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800',
                      ]"
                    >
                      {{
                        fingerprintData?.visitorFound ? $t("found") : $t("new")
                      }}
                    </span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("cache_hit") }}:</span>
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs',
                        fingerprintData?.cacheHit
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800',
                      ]"
                    >
                      {{ fingerprintData?.cacheHit ? $t("yes") : $t("no") }}
                    </span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("duplicate") }}:</span>
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs',
                        fingerprintData?.isDuplicateAttempt
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800',
                      ]"
                    >
                      {{
                        fingerprintData?.isDuplicateAttempt
                          ? $t("yes")
                          : $t("no")
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confidence Score -->
            <div
              v-if="fingerprintData?.confidence"
              class="bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <h3
                class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
              >
                {{ $t("confidence_score") }}
              </h3>
              <div class="space-y-2 max-md:space-y-1.5">
                <div class="flex justify-between max-md:flex-col max-md:gap-2">
                  <span class="text-gray-600 max-md:text-sm"
                    >{{ $t("score") }}:</span
                  >
                  <div class="flex items-center gap-2">
                    <div
                      class="w-24 bg-gray-200 rounded-full h-2 max-md:w-full"
                    >
                      <div
                        class="bg-indigo-600 h-2 rounded-full"
                        :style="{
                          width: `${
                            (fingerprintData.confidence.score || 0) * 100
                          }%`,
                        }"
                      ></div>
                    </div>
                    <span class="font-medium max-md:text-sm"
                      >{{
                        ((fingerprintData.confidence.score || 0) * 100).toFixed(
                          1
                        )
                      }}%</span
                    >
                  </div>
                </div>
                <div class="flex justify-between max-md:text-sm">
                  <span class="text-gray-600">{{ $t("revision") }}:</span>
                  <span class="font-medium">{{
                    fingerprintData.confidence.revision || "-"
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
              <h3
                class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
              >
                {{ $t("timestamps") }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3">
                <div class="space-y-2 max-md:space-y-1.5">
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("created_at") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.createdAt
                        ? formatDate(fingerprintData.createdAt)
                        : "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("updated_at") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.updatedAt
                        ? formatDate(fingerprintData.updatedAt)
                        : "-"
                    }}</span>
                  </div>
                </div>
                <div class="space-y-2 max-md:space-y-1.5">
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600"
                      >{{ $t("first_seen_global") }}:</span
                    >
                    <span class="font-medium">{{
                      fingerprintData?.firstSeenAt?.global
                        ? formatDate(fingerprintData.firstSeenAt.global)
                        : "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600"
                      >{{ $t("last_seen_global") }}:</span
                    >
                    <span class="font-medium">{{
                      fingerprintData?.lastSeenAt?.global
                        ? formatDate(fingerprintData.lastSeenAt.global)
                        : "-"
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Device Info Tab -->
          <div v-if="activeTab === 'device'" class="space-y-6 max-md:space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-md:gap-4">
              <!-- Browser Information -->
              <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
                <h3
                  class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
                >
                  {{ $t("browser_information") }}
                </h3>
                <div class="space-y-2 max-md:space-y-1.5">
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("browser_name") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.browserName || "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600"
                      >{{ $t("browser_version") }}:</span
                    >
                    <span class="font-medium">{{
                      fingerprintData?.browserVersion || "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600"
                      >{{ $t("incognito_mode") }}:</span
                    >
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs',
                        fingerprintData?.incognito
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800',
                      ]"
                    >
                      {{ fingerprintData?.incognito ? $t("yes") : $t("no") }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Operating System -->
              <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
                <h3
                  class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
                >
                  {{ $t("operating_system") }}
                </h3>
                <div class="space-y-2 max-md:space-y-1.5">
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("os_name") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.os || "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("os_version") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.osVersion || "-"
                    }}</span>
                  </div>
                  <div class="flex justify-between max-md:text-sm">
                    <span class="text-gray-600">{{ $t("device_type") }}:</span>
                    <span class="font-medium">{{
                      fingerprintData?.device || "-"
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Network Information -->
            <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
              <h3
                class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
              >
                {{ $t("network_information") }}
              </h3>
              <div class="space-y-2 max-md:space-y-1.5">
                <div class="flex justify-between max-md:text-sm">
                  <span class="text-gray-600">{{ $t("ip_address") }}:</span>
                  <span
                    class="font-mono bg-gray-200 px-2 py-1 rounded max-md:text-xs"
                    >{{ fingerprintData?.ip || "-" }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Metadata -->
            <div
              v-if="fingerprintData?.meta"
              class="bg-gray-50 p-4 rounded-lg max-md:p-3"
            >
              <h3
                class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
              >
                {{ $t("metadata") }}
              </h3>
              <div class="space-y-2 max-md:space-y-1.5">
                <div class="flex justify-between max-md:text-sm">
                  <span class="text-gray-600">{{ $t("version") }}:</span>
                  <span class="font-medium">{{
                    fingerprintData.meta.version || "-"
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- History Tab -->
          <div
            v-if="activeTab === 'history'"
            class="space-y-6 max-md:space-y-4"
          >
            <div class="bg-gray-50 p-4 rounded-lg max-md:p-3">
              <h3
                class="text-lg font-medium mb-3 text-gray-900 max-md:text-base max-md:mb-2"
              >
                {{ $t("fingerprint_history") }}
              </h3>
              <div class="space-y-4 max-md:space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3">
                  <div class="space-y-2 max-md:space-y-1.5">
                    <h4 class="font-medium text-gray-900 max-md:text-sm">
                      {{ $t("first_seen") }}
                    </h4>
                    <div
                      class="text-sm space-y-1 max-md:text-xs max-md:space-y-0.5"
                    >
                      <div class="flex justify-between">
                        <span class="text-gray-600">{{ $t("global") }}:</span>
                        <span>{{
                          fingerprintData?.firstSeenAt?.global
                            ? formatDate(fingerprintData.firstSeenAt.global)
                            : "-"
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600"
                          >{{ $t("subscription") }}:</span
                        >
                        <span>{{
                          fingerprintData?.firstSeenAt?.subscription
                            ? formatDate(
                                fingerprintData.firstSeenAt.subscription
                              )
                            : "-"
                        }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2 max-md:space-y-1.5">
                    <h4 class="font-medium text-gray-900 max-md:text-sm">
                      {{ $t("last_seen") }}
                    </h4>
                    <div
                      class="text-sm space-y-1 max-md:text-xs max-md:space-y-0.5"
                    >
                      <div class="flex justify-between">
                        <span class="text-gray-600">{{ $t("global") }}:</span>
                        <span>{{
                          fingerprintData?.lastSeenAt?.global
                            ? formatDate(fingerprintData.lastSeenAt.global)
                            : "-"
                        }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600"
                          >{{ $t("subscription") }}:</span
                        >
                        <span>{{
                          fingerprintData?.lastSeenAt?.subscription
                            ? formatDate(
                                fingerprintData.lastSeenAt.subscription
                              )
                            : "-"
                        }}</span>
                      </div>
                    </div>
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
  fingerprintData: {
    type: Object,
    required: false,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:show"]);
const { onBackdropDown, onBackdropUp } = useModalBackdrop(() => {
  emit("update:show", false);
});
const { publicGet } = useApiEndpoint();

const activeTab = ref("basic");
const isLoadingUserFingerprints = ref(false);
const userFingerprints = ref([]);

const tabs = [
  { label: "Basic Info", labelCN: "基本信息", value: "basic" },
  { label: "Device Info", labelCN: "设备信息", value: "device" },
  { label: "History", labelCN: "历史记录", value: "history" },
];

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      activeTab.value = "basic";
      userFingerprints.value = [];
    }
  }
);
</script>
