<template>
  <div class="flex h-screen bg-[#111b21] text-sm max-md:overflow-hidden">
    <!-- Image Preview Modal -->
    <div
      v-if="previewImage"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center custom-modal"
      @click="previewImage = null"
    >
      <button
        @click="previewImage = null"
        class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <Icon icon="mdi:close" class="w-8 h-8" />
      </button>
      <img
        :src="previewImage"
        class="max-w-[90vw] max-h-[90vh] object-contain"
        @click.stop
      />
    </div>
    <div
      class="w-72 bg-[#111b21] border-r border-[#2a3942] flex flex-col md:relative max-md:fixed max-md:inset-0 max-md:w-full max-md:z-50"
      :class="{ 'max-md:hidden': selectedConversation }"
    >
      <!-- Header -->
      <div class="px-3">
        <div class="flex items-center gap-2 border-b border-[#2a3942] py-4">
          <div class="flex items-center">
            <img src="/favicon.png" alt="Logo" class="w-5 h-auto" />
            <div class="h-5 w-[1.5px] bg-gray-500 mx-1.5"></div>
            <img
              src="/images/whatsapp/icon.png"
              alt="WhatsApp"
              class="w-6 h-auto"
            />
          </div>
          <h1 class="text-base font-semibold text-gray-100">WhatsApp</h1>
        </div>
        <!-- Search -->
        <div class="relative py-2">
          <Icon
            icon="mdi:magnify"
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search conversations..."
            class="w-full pl-8 pr-8 py-2 bg-[#202c33] border-none rounded-lg text-sm text-gray-100 placeholder-gray-400 outline-none"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            <Icon icon="mdi:close" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Conversations List -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="conv in filteredConversations"
          :key="conv.conversationId"
          @click="selectConversation(conv)"
          @contextmenu.prevent="openContextMenu($event, conv)"
          class="px-3 py-2.5 cursor-pointer transition-colors relative group rounded-xl mx-2 my-1"
          :class="
            selectedConversation?.conversationId === conv.conversationId
              ? 'bg-[#2a3942]'
              : 'hover:bg-[#202c33]'
          "
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            >
              {{ conv.contactName?.charAt(0) || conv.contactPhone?.slice(-2) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-1">
                  <p class="text-sm font-medium text-gray-100 truncate">
                    {{ conv.contactName || conv.contactPhone }}
                  </p>
                  <Icon
                    v-if="conv.isPinned"
                    icon="mdi:pin"
                    class="w-3 h-3 text-[#00a884] flex-shrink-0"
                  />
                  <span
                    v-if="conv.needsAgent"
                    class="px-1 py-0.5 text-[9px] bg-orange-500/20 text-orange-400 rounded flex-shrink-0"
                  >
                    Pending Reply
                  </span>
                  <span
                    v-else-if="
                      conv.step &&
                      conv.step !== 'waiting_agent' &&
                      conv.step !== 'waiting_screenshot'
                    "
                    class="px-1 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 rounded flex-shrink-0"
                  >
                    Bot
                  </span>
                </div>
                <span class="text-[10px] text-gray-400">
                  {{ formatTime(conv.lastMessageAt) }}
                </span>
              </div>
              <p class="text-xs text-gray-400 truncate">
                {{ conv.contactPhone }}
              </p>
              <p class="text-[11px] text-gray-500 truncate mt-0.5">
                {{ conv.lastMessage || "No messages" }}
              </p>
            </div>
            <div
              v-if="conv.unreadCount > 0"
              class="w-4 h-4 bg-[#00a884] rounded-full flex items-center justify-center flex-shrink-0"
            >
              <span class="text-[10px] text-white">{{ conv.unreadCount }}</span>
            </div>
          </div>
        </div>

        <div
          v-if="filteredConversations.length === 0 && searchQuery"
          class="p-6 text-center text-gray-400 text-sm"
        >
          No results found
        </div>
        <div
          v-else-if="conversations.length === 0"
          class="p-6 text-center text-gray-400 text-sm"
        >
          No conversations
        </div>
      </div>

      <div
        v-if="contextMenu.show"
        class="fixed bg-[#233138] rounded-lg shadow-lg py-1 z-50 min-w-[140px] border border-[#2a3942]"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      >
        <button
          @click="togglePinFromMenu"
          class="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-[#2a3942] flex items-center gap-2"
        >
          <Icon
            :icon="contextMenu.conv?.isPinned ? 'mdi:pin-off' : 'mdi:pin'"
            class="w-4 h-4"
          />
          {{ contextMenu.conv?.isPinned ? "Unpin" : "Pin" }}
        </button>
        <button
          v-if="
            contextMenu.conv?.step && contextMenu.conv?.step !== 'waiting_agent'
          "
          @click="skipBotFromMenu"
          class="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-[#2a3942] flex items-center gap-2"
        >
          <Icon icon="mdi:robot-off" class="w-4 h-4" />
          Skip Bot
        </button>
        <button
          v-if="contextMenu.conv?.needsAgent"
          @click="markRepliedFromMenu"
          class="w-full px-3 py-2 text-left text-sm text-gray-100 hover:bg-[#2a3942] flex items-center gap-2"
        >
          <Icon icon="mdi:check-circle" class="w-4 h-4" />
          Mark as Replied
        </button>
      </div>

      <div
        v-if="contextMenu.show"
        class="fixed inset-0 z-40"
        @click="contextMenu.show = false"
      ></div>

      <!-- My Account -->
      <div class="px-3 py-2.5 border-t border-[#2a3942] bg-[#202c33]">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center text-white flex-shrink-0"
          >
            <Icon icon="mdi:headset" class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-100 truncate">
              {{ myAccount.name }}
            </p>
            <p class="text-[11px] text-gray-400 truncate">
              {{ myAccount.phone }}
            </p>
          </div>
          <div
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            :class="
              myAccount.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
            "
            :title="myAccount.status === 'active' ? 'Online' : 'Offline'"
          ></div>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区 -->
    <div
      class="flex-1 flex flex-col min-h-0 md:relative max-md:fixed max-md:inset-0 max-md:z-50 max-md:bg-[#111b21]"
      :class="{ hidden: !selectedConversation, flex: selectedConversation }"
    >
      <div
        v-if="!selectedConversation"
        class="flex-1 flex items-center justify-center bg-[#222e35]"
      >
        <div class="text-center text-gray-400">
          <Icon
            icon="mdi:whatsapp"
            class="w-12 h-12 mx-auto mb-3 text-[#00a884]"
          />
          <p class="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>

      <template v-else>
        <!-- Chat Header -->
        <div
          class="px-3 py-2 bg-[#202c33] border-b border-[#2a3942] flex justify-between items-center"
        >
          <div class="flex items-center gap-2.5">
            <button
              @click="selectedConversation = null"
              class="md:hidden p-1.5 hover:bg-[#2a3942] rounded-full"
            >
              <Icon icon="mdi:arrow-left" class="w-4 h-4 text-gray-300" />
            </button>
            <div
              class="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center text-white text-sm font-semibold"
            >
              {{
                selectedConversation.contactName?.charAt(0) ||
                selectedConversation.contactPhone?.slice(-2)
              }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-100">
                {{
                  selectedConversation.contactName ||
                  selectedConversation.contactPhone
                }}
              </p>
              <div class="flex items-center gap-1">
                <p class="text-xs text-gray-400">
                  {{ selectedConversation.contactPhone }}
                </p>
                <button
                  @click="copyPhone(selectedConversation.contactPhone)"
                  class="p-0.5 text-gray-400 hover:text-[#00a884] rounded transition-colors"
                  :title="copied ? 'Copied' : 'Copy number'"
                >
                  <Icon
                    :icon="copied ? 'mdi:check' : 'mdi:content-copy'"
                    class="w-3 h-3"
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
              class="w-24 h-auto max-w-[150px] transition-all duration-300 max-md:max-w-[50px]"
            />
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 bg-[#0b141a]"
          style="
            background-image: linear-gradient(
                rgba(11, 20, 26, 0.85),
                rgba(11, 20, 26, 0.85)
              ),
              url('/images/whatsapp/bg2.png');
            background-repeat: repeat;
            background-size: 400px;
          "
          @scroll="handleScroll"
        >
          <div
            v-for="msg in messages"
            :key="msg.messageId"
            class="flex items-end gap-1.5"
            :class="msg.direction === 'sent' ? 'justify-end' : 'justify-start'"
          >
            <div
              v-if="msg.direction === 'received'"
              class="w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
            >
              {{
                selectedConversation.contactName?.charAt(0) ||
                selectedConversation.contactPhone?.slice(-2)
              }}
            </div>
            <div
              class="max-w-[70%] px-2.5 py-1.5 rounded-lg shadow"
              :class="[
                msg.direction === 'sent' ? 'bg-[#005c4b]' : 'bg-[#202c33]',
                msg.status === 'sending' ? 'opacity-70' : '',
                msg.status === 'failed' ? 'border border-red-500' : '',
              ]"
            >
              <img
                v-if="msg.type === 'image'"
                :src="msg.content?.image?.url"
                class="w-56 h-auto rounded cursor-pointer"
                @click="openImage(msg.content?.image?.url)"
                @load="onImageLoad"
              />
              <p
                v-if="msg.type === 'image' && msg.content?.image?.caption"
                class="text-sm text-gray-100 mt-1.5 whitespace-pre-wrap break-all"
              >
                {{ msg.content.image.caption }}
              </p>
              <p
                v-if="msg.type !== 'image'"
                class="text-sm text-gray-100 whitespace-pre-wrap break-all"
              >
                {{ msg.content?.text }}
              </p>
              <div class="flex items-center justify-end gap-1 mt-0.5">
                <p class="text-[10px] text-gray-400">
                  {{ formatTime(msg.createdAt) }}
                </p>
                <Icon
                  v-if="msg.direction === 'sent' && msg.status === 'sending'"
                  icon="mdi:clock-outline"
                  class="w-2.5 h-2.5 text-gray-400"
                />
                <Icon
                  v-else-if="
                    msg.direction === 'sent' && msg.status === 'failed'
                  "
                  icon="mdi:alert-circle"
                  class="w-2.5 h-2.5 text-red-500"
                />
                <Icon
                  v-else-if="msg.direction === 'sent'"
                  icon="mdi:check"
                  class="w-2.5 h-2.5 text-gray-400"
                />
              </div>
            </div>
          </div>

          <!-- Scroll Button -->
          <button
            v-if="showScrollButton"
            @click="scrollToBottomAndRead"
            class="absolute bottom-16 right-3 bg-[#202c33] text-gray-300 p-2 rounded-full shadow-lg hover:bg-[#2a3942] transition-colors z-20"
          >
            <div
              v-if="newMessageCount > 0"
              class="absolute -top-1.5 -right-1.5 bg-[#00a884] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
            >
              {{ newMessageCount }}
            </div>
            <Icon icon="mdi:chevron-down" class="w-5 h-5" />
          </button>
        </div>

        <!-- Image Preview -->
        <div v-if="imagePreview" class="px-3 py-2 bg-[#2a3942]">
          <div class="flex items-start gap-2.5">
            <div class="relative">
              <img :src="imagePreview" class="w-24 h-24 object-cover rounded" />
              <button
                @click="cancelImage"
                class="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <Icon icon="mdi:close" class="w-3 h-3" />
              </button>
            </div>
            <div class="flex-1">
              <input
                ref="captionInput"
                v-model="imageCaption"
                type="text"
                placeholder="Add a caption..."
                class="w-full px-2.5 py-1.5 bg-[#202c33] border-none rounded text-sm text-gray-100 placeholder-gray-400 outline-none"
                @keyup.enter="sendImageWithCaption"
              />
            </div>
            <button
              @click="sendImageWithCaption"
              :disabled="isUploading"
              class="px-3 py-1.5 bg-[#00a884] text-white text-sm rounded-full hover:bg-[#00c897] disabled:opacity-50 transition-colors"
            >
              <Icon
                v-if="isUploading"
                icon="mdi:loading"
                class="w-4 h-4 animate-spin"
              />
              <span v-else>Send</span>
            </button>
          </div>
        </div>

        <!-- Input Area -->
        <div class="px-3 py-2 bg-[#202c33] border-t border-[#2a3942]">
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
              class="absolute bottom-12 left-0 z-10"
            />
            <form
              @submit.prevent="sendMessage"
              class="flex gap-1.5 items-center"
            >
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
                class="p-1.5 text-gray-400 hover:text-[#00a884] hover:bg-[#2a3942] rounded-full transition-colors"
              >
                <Icon
                  v-if="isUploading"
                  icon="mdi:loading"
                  class="w-5 h-5 animate-spin"
                />
                <Icon v-else icon="mdi:image" class="w-5 h-5" />
              </button>
              <button
                type="button"
                @click="showEmojiPicker = !showEmojiPicker"
                class="p-1.5 text-gray-400 hover:text-[#00a884] hover:bg-[#2a3942] rounded-full transition-colors"
              >
                <Icon icon="mdi:emoticon-outline" class="w-5 h-5" />
              </button>
              <input
                v-model="newMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-1 px-3 py-1.5 bg-[#2a3942] border-none rounded-full text-sm text-gray-100 placeholder-gray-400 outline-none"
                @focus="showEmojiPicker = false"
              />
              <button
                type="submit"
                :disabled="!newMessage.trim() || isSending"
                class="py-2 px-2 bg-[#00a884] text-white hover:bg-[#00c897] rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon
                  v-if="isSending"
                  icon="mdi:loading"
                  class="w-4 h-4 animate-spin"
                />
                <Icon v-else icon="mdi:send" class="w-4 h-4" />
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
  const tempId = `temp-${Date.now()}`;
  const tempMessage = {
    messageId: tempId,
    conversationId: selectedConversation.value.conversationId,
    direction: "sent",
    type: "text",
    content: { text: newMessage.value },
    createdAt: new Date().toISOString(),
    status: "sending",
  };
  messages.value.push(tempMessage);
  const messageText = newMessage.value;
  newMessage.value = "";
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
  try {
    await post(
      `conversations/${selectedConversation.value.conversationId}/send`,
      { text: messageText }
    );
    await fetchMessages(
      selectedConversation.value.conversationId,
      isAtBottom.value
    );
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  } catch (error) {
    console.error("Failed to send message:", error);
    const index = messages.value.findIndex((m) => m.messageId === tempId);
    if (index !== -1) {
      messages.value[index].status = "failed";
    }
  }
};
const previewImage = ref(null);

const openImage = (url) => {
  previewImage.value = url;
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
    const phoneWithoutPlus = phone.replace(/^\+/, "");
    await navigator.clipboard.writeText(phoneWithoutPlus);
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

watch(
  () => totalUnread.value,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      const shouldNotify = conversations.value.some(
        (conv) => conv.unreadCount > 0 && conv.needsAgent === true
      );

      if (shouldNotify) {
        playNotificationSound();
      }
    }
  }
);

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

const imagePreview = ref(null);
const imageFile = ref(null);
const imageCaption = ref("");
const captionInput = ref(null);
const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (!file || !selectedConversation.value) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  fileInput.value.value = "";
  nextTick(() => {
    if (captionInput.value) {
      captionInput.value.focus();
    }
  });
};

const cancelImage = () => {
  imagePreview.value = null;
  imageFile.value = null;
  imageCaption.value = "";
};

const sendImageWithCaption = async () => {
  if (!imageFile.value || !selectedConversation.value) return;
  isUploading.value = true;
  const file = imageFile.value;
  const caption = imageCaption.value;
  const previewUrl = imagePreview.value;
  cancelImage();

  const tempId = `temp-${Date.now()}`;
  const tempMessage = {
    messageId: tempId,
    conversationId: selectedConversation.value.conversationId,
    direction: "sent",
    type: "image",
    content: {
      image: {
        url: previewUrl,
        caption: caption,
      },
    },
    createdAt: new Date().toISOString(),
    status: "sending",
  };
  messages.value.push(tempMessage);

  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }

  try {
    const formData = new FormData();
    formData.append("image", file);
    const { data: uploadData } = await post("upload/image", formData);

    if (uploadData.success) {
      await post(
        `conversations/${selectedConversation.value.conversationId}/send-image`,
        {
          imageUrl: uploadData.url,
          caption: caption,
        }
      );
      const index = messages.value.findIndex((m) => m.messageId === tempId);
      if (index !== -1) {
        messages.value[index].content.image.url = uploadData.url;
        messages.value[index].status = "sent";
      }
    }
  } catch (error) {
    console.error("Failed to send image:", error);
    const index = messages.value.findIndex((m) => m.messageId === tempId);
    if (index !== -1) {
      messages.value[index].status = "failed";
    }
  } finally {
    isUploading.value = false;
  }
};

const onImageLoad = () => {
  if (isAtBottom.value && messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const myAccount = ref({
  name: "Customer Service",
  phone: "",
  status: "active",
});

const fetchMyAccount = async () => {
  try {
    const { data } = await get("whatsapp/account");
    myAccount.value = data;
  } catch (error) {
    console.error("Failed to fetch account:", error);
  }
};

const searchQuery = ref("");
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return conversations.value;
  }

  const query = searchQuery.value.toLowerCase();
  return conversations.value.filter((conv) => {
    return (
      conv.contactName?.toLowerCase().includes(query) ||
      conv.contactPhone?.includes(query) ||
      conv.lastMessage?.toLowerCase().includes(query)
    );
  });
});

const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  conv: null,
});

const openContextMenu = (event, conv) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    conv: conv,
  };
};

const togglePinFromMenu = async () => {
  if (contextMenu.value.conv) {
    await togglePin(contextMenu.value.conv);
  }
  contextMenu.value.show = false;
};

const skipBotFromMenu = async () => {
  if (contextMenu.value.conv) {
    try {
      await post(
        `conversations/${contextMenu.value.conv.conversationId}/skip-bot`
      );
      await fetchConversations();
    } catch (error) {
      console.error("Failed to skip bot:", error);
    }
  }
  contextMenu.value.show = false;
};

const markRepliedFromMenu = async () => {
  if (contextMenu.value.conv) {
    try {
      await post(
        `conversations/${contextMenu.value.conv.conversationId}/mark-replied`
      );
      await fetchConversations();
    } catch (error) {
      console.error("Failed to mark as replied:", error);
    }
  }
  contextMenu.value.show = false;
};

onMounted(() => {
  notificationSound.value = new Audio("/sound/whatsapp-notification.mp3");
  notificationSound.value.volume = 0.5;
  fetchConversations();
  fetchMyAccount();
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
