<template>
  <div class="flex h-screen bg-[#111b21]">
    <div
      class="w-80 bg-[#111b21] border-r border-[#2a3942] flex flex-col max-md:w-full"
      :class="{ 'max-md:hidden': selectedConversation }"
    >
      <div class="p-4 border-b border-[#2a3942]">
        <div class="flex items-center gap-2">
          <div class="flex items-center">
            <img src="/favicon.png" alt="Logo" class="w-6 h-auto" />
            <div class="h-6 w-[2px] bg-gray-500 mx-2"></div>
            <img
              src="/images/whatsapp/icon.png"
              alt="WhatsApp"
              class="w-8 h-auto"
            />
          </div>
          <h1 class="text-xl font-semibold text-gray-100">WhatsApp</h1>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div
          v-for="conv in conversations"
          :key="conv.conversationId"
          @click="selectConversation(conv)"
          class="p-4 border-b border-[#2a3942] cursor-pointer transition-colors relative group"
          :class="
            selectedConversation?.conversationId === conv.conversationId
              ? 'bg-[#2a3942]'
              : 'hover:bg-[#202c33]'
          "
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center text-white font-semibold"
            >
              {{ conv.contactName?.charAt(0) || conv.contactPhone?.slice(-2) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-1">
                  <p class="font-medium text-gray-100 truncate">
                    {{ conv.contactName || conv.contactPhone }}
                  </p>
                  <div>
                    <button
                      @click.stop="togglePin(conv)"
                      class="p-1 transition-opacity"
                      :class="
                        conv.isPinned
                          ? 'text-[#00a884]'
                          : 'text-gray-400 hover:text-[#00a884] opacity-0 group-hover:opacity-100'
                      "
                      :title="conv.isPinned ? 'Unpin' : 'Pin'"
                    >
                      <Icon
                        :icon="conv.isPinned ? 'mdi:pin' : 'mdi:pin-outline'"
                        class="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>
                <span class="text-xs text-gray-400">
                  {{ formatTime(conv.lastMessageAt) }}
                </span>
              </div>
              <p class="text-sm text-gray-400 truncate">
                {{ conv.contactPhone }}
              </p>
              <p class="text-xs text-gray-500 truncate pt-1">
                {{ conv.lastMessage || "No messages" }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div
                v-if="conv.unreadCount > 0"
                class="w-5 h-5 bg-[#00a884] rounded-full flex items-center justify-center"
              >
                <span class="text-xs text-white">{{ conv.unreadCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="conversations.length === 0"
          class="p-8 text-center text-gray-400"
        >
          No conversations
        </div>
      </div>
    </div>

    <div
      class="flex-1 flex flex-col"
      :class="{ 'max-md:hidden': !selectedConversation }"
    >
      <div
        v-if="!selectedConversation"
        class="flex-1 flex items-center justify-center bg-[#222e35]"
      >
        <div class="text-center text-gray-400">
          <Icon
            icon="mdi:whatsapp"
            class="w-16 h-16 mx-auto mb-4 text-[#00a884]"
          />
          <p>Select a conversation to start chatting</p>
        </div>
      </div>

      <template v-else>
        <div
          class="p-4 bg-[#202c33] border-b border-[#2a3942] flex justify-between"
        >
          <div class="flex items-center gap-3">
            <button
              @click="selectedConversation = null"
              class="md:hidden p-2 hover:bg-[#2a3942] rounded-full"
            >
              <Icon icon="mdi:arrow-left" class="w-5 h-5 text-gray-300" />
            </button>
            <div
              class="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white font-semibold"
            >
              {{
                selectedConversation.contactName?.charAt(0) ||
                selectedConversation.contactPhone?.slice(-2)
              }}
            </div>
            <div>
              <p class="font-medium text-gray-100">
                {{
                  selectedConversation.contactName ||
                  selectedConversation.contactPhone
                }}
              </p>
              <div class="flex items-center gap-1">
                <p class="text-sm text-gray-400">
                  {{ selectedConversation.contactPhone }}
                </p>
                <button
                  @click="copyPhone(selectedConversation.contactPhone)"
                  class="p-1 text-gray-400 hover:text-[#00a884] rounded transition-colors"
                  :title="copied ? 'Copied' : 'Copy number'"
                >
                  <Icon
                    :icon="copied ? 'mdi:check' : 'mdi:content-copy'"
                    class="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-center items-center">
            <NuxtImg
              :src="companyLogo"
              format="webp"
              quality="80"
              alt="Logo"
              class="w-32 h-auto max-w-[200px] lg:group-hover:brightness-110 transition-all duration-300 max-md:max-w-[60px]"
            />
          </div>
        </div>

        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a]"
          style="
            background-image: linear-gradient(
                rgba(11, 20, 26, 0.85),
                rgba(11, 20, 26, 0.85)
              ),
              url('/images/whatsapp/bg.jpg');
            background-repeat: repeat;
            background-size: 400px;
          "
          @scroll="handleScroll"
        >
          <div
            v-for="msg in messages"
            :key="msg.messageId"
            class="flex items-end gap-2"
            :class="msg.direction === 'sent' ? 'justify-end' : 'justify-start'"
          >
            <div
              v-if="msg.direction === 'received'"
              class="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            >
              {{
                selectedConversation.contactName?.charAt(0) ||
                selectedConversation.contactPhone?.slice(-2)
              }}
            </div>
            <div
              class="max-w-[70%] px-4 py-2 rounded-lg shadow"
              :class="
                msg.direction === 'sent' ? 'bg-[#005c4b]' : 'bg-[#202c33]'
              "
            >
              <img
                v-if="msg.type === 'image'"
                :src="msg.content?.image?.url"
                class="w-72 h-auto rounded cursor-pointer"
                @click="openImage(msg.content?.image?.url)"
              />
              <p v-else class="text-gray-100">{{ msg.content?.text }}</p>
              <p class="text-xs text-gray-400 text-right mt-1">
                {{ formatTime(msg.createdAt) }}
              </p>
            </div>
            <div
              v-if="msg.direction === 'sent'"
              class="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center text-white flex-shrink-0"
            >
              <Icon icon="mdi:headset" class="w-5 h-5" />
            </div>
          </div>
          <button
            v-if="showScrollButton"
            @click="scrollToBottomAndRead"
            class="absolute bottom-20 right-4 bg-[#202c33] text-gray-300 p-3 rounded-full shadow-lg hover:bg-[#2a3942] transition-colors z-20"
          >
            <div
              v-if="newMessageCount > 0"
              class="absolute -top-2 -right-2 bg-[#00a884] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ newMessageCount }}
            </div>
            <Icon icon="mdi:chevron-down" class="w-6 h-6" />
          </button>
        </div>

        <div class="p-4 bg-[#202c33] border-t border-[#2a3942]">
          <div class="relative">
            <div
              v-if="showEmojiPicker"
              class="fixed inset-0 z-0"
              @click="showEmojiPicker = false"
            ></div>
            <EmojiPicker
              v-if="showEmojiPicker"
              :native="true"
              :theme="'dark'"
              @select="onSelectEmoji"
              class="absolute bottom-14 left-0 z-10"
            />
            <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                class="hidden"
                @change="handleImageSelect"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                :disabled="isUploading"
                class="p-2 text-gray-400 hover:text-[#00a884] hover:bg-[#2a3942] rounded-full transition-colors"
              >
                <Icon
                  v-if="isUploading"
                  icon="mdi:loading"
                  class="w-6 h-6 animate-spin"
                />
                <Icon v-else icon="mdi:image" class="w-6 h-6" />
              </button>
              <button
                type="button"
                @click="showEmojiPicker = !showEmojiPicker"
                class="p-2 text-gray-400 hover:text-[#00a884] hover:bg-[#2a3942] rounded-full transition-colors"
              >
                <Icon icon="mdi:emoticon-outline" class="w-6 h-6" />
              </button>
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-1 px-4 py-2 bg-[#2a3942] border-none rounded-full text-gray-100 placeholder-gray-400 outline-none"
                @focus="showEmojiPicker = false"
              />
              <button
                type="submit"
                :disabled="!newMessage.trim() || isSending"
                class="px-6 py-2 bg-[#00a884] text-white rounded-full hover:bg-[#00c897] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon
                  v-if="isSending"
                  icon="mdi:loading"
                  class="w-5 h-5 animate-spin"
                />
                <Icon v-else icon="mdi:send" class="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@iconify/vue";
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";

const { get, post } = useApiEndpoint();
const copied = ref(false);
const conversations = ref([]);
const messages = ref([]);
const selectedConversation = ref(null);
const newMessage = ref("");
const isSending = ref(false);
const isUploading = ref(false);
const messagesContainer = ref(null);
const fileInput = ref(null);
const showEmojiPicker = ref(false);
const showScrollButton = ref(false);
const newMessageCount = ref(0);
const isAtBottom = ref(true);
const lastMessageCount = ref(0);
const companyLogo = computed(() => {
  const companyId = localStorage.getItem("companyId");
  return COMPANIES[companyId]?.logo || "/images/logo/emtech88.png";
});

const fetchConversations = async () => {
  try {
    const { data } = await get("conversations");
    conversations.value = data;
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
  }
};

const fetchMessages = async (conversationId, markAsRead = false) => {
  try {
    const { data } = await get(
      `conversations/${conversationId}/messages?markAsRead=${markAsRead}`
    );
    const hasNewMessage = data.length > lastMessageCount.value;
    if (hasNewMessage && !isAtBottom.value) {
      newMessageCount.value += data.length - lastMessageCount.value;
    }
    messages.value = data;
    lastMessageCount.value = data.length;
    return hasNewMessage;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return false;
  }
};

const selectConversation = async (conv) => {
  selectedConversation.value = conv;
  lastMessageCount.value = 0;
  await fetchMessages(conv.conversationId, true);
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
  const convInList = conversations.value.find(
    (c) => c.conversationId === conv.conversationId
  );
  if (convInList) {
    convInList.unreadCount = 0;
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return;
  isSending.value = true;
  try {
    await post(
      `conversations/${selectedConversation.value.conversationId}/send`,
      { text: newMessage.value }
    );
    newMessage.value = "";
    await fetchMessages(selectedConversation.value.conversationId);
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  } catch (error) {
    console.error("Failed to send message:", error);
  } finally {
    isSending.value = false;
  }
};

const handleImageSelect = async (event) => {
  const file = event.target.files[0];
  if (!file || !selectedConversation.value) return;
  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append("image", file);
    const { data: uploadData } = await post("upload/image", formData);
    if (uploadData.success) {
      await post(
        `conversations/${selectedConversation.value.conversationId}/send-image`,
        { imageUrl: uploadData.url }
      );
      await fetchMessages(selectedConversation.value.conversationId);
    }
  } catch (error) {
    console.error("Failed to send image:", error);
  } finally {
    isUploading.value = false;
    fileInput.value.value = "";
  }
};

const openImage = (url) => {
  window.open(url, "_blank");
};

const onSelectEmoji = (emoji) => {
  newMessage.value += emoji.i;
  showEmojiPicker.value = false;
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const copyPhone = async (phone) => {
  try {
    await navigator.clipboard.writeText(phone);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 500);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};

const handleScroll = () => {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 100;
  showScrollButton.value = !isAtBottom.value;
  if (isAtBottom.value) {
    newMessageCount.value = 0;
  }
};

const scrollToBottomAndRead = async () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
  newMessageCount.value = 0;
  showScrollButton.value = false;
  if (selectedConversation.value) {
    await get(
      `conversations/${selectedConversation.value.conversationId}/messages?markAsRead=true`
    );
    const convInList = conversations.value.find(
      (c) => c.conversationId === selectedConversation.value.conversationId
    );
    if (convInList) {
      convInList.unreadCount = 0;
    }
  }
};

let refreshInterval;

const notificationSound = ref(null);
const totalUnread = computed(() => {
  return conversations.value.reduce(
    (sum, conv) => sum + (conv.unreadCount || 0),
    0
  );
});

const playNotificationSound = () => {
  if (notificationSound.value) {
    notificationSound.value.currentTime = 0;
    notificationSound.value
      .play()
      .catch((err) => console.log("Audio play failed:", err));
  }
};

const prevTotalUnread = ref(0);
watch(totalUnread, (newVal, oldVal) => {
  if (newVal > oldVal) {
    playNotificationSound();
  }
  prevTotalUnread.value = newVal;
});

const togglePin = async (conv) => {
  try {
    if (conv.isPinned) {
      await post(`conversations/${conv.conversationId}/unpin`);
    } else {
      await post(`conversations/${conv.conversationId}/pin`);
    }
    await fetchConversations();
  } catch (error) {
    console.error("Failed to toggle pin:", error);
  }
};

onMounted(() => {
  notificationSound.value = new Audio("/sound/whatsapp-notification.mp3");
  notificationSound.value.volume = 0.5;
  fetchConversations();
  refreshInterval = setInterval(() => {
    fetchConversations();
    if (selectedConversation.value) {
      fetchMessages(
        selectedConversation.value.conversationId,
        isAtBottom.value
      );
    }
  }, 3000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

useHead({
  title: computed(() => {
    if (totalUnread.value > 0) {
      return `(${totalUnread.value}) Play System | WhatsApp`;
    }
    return "Play System | WhatsApp";
  }),
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});
</script>
