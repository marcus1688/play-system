<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 max-md:p-2"
      @click.self="handleClose"
    >
      <PageLoading v-if="isPageLoading" />
      <div
        class="bg-white rounded-lg border w-full max-w-4xl max-h-[80vh] flex flex-col max-md:max-h-[90vh]"
      >
        <div class="p-4 border-b flex-shrink-0 max-md:p-3">
          <div class="flex justify-between items-start max-md:gap-2">
            <div class="flex-1 min-w-0">
              <h3
                class="text-xl max-sm:text-base font-bold text-gray-800 max-md:text-lg truncate"
              >
                {{ $t("chat_with", { username: feedback?.username }) }}
              </h3>
              <div class="text-gray-500 text-sm mt-1 max-md:text-xs truncate">
                {{
                  $t("ticket_number", {
                    id: feedback?._id?.slice(-6),
                    problemType: feedback?.problemType,
                  })
                }}
              </div>
              <div class="text-gray-400 text-xs max-md:text-[10px]">
                {{ formatDate(feedback?.createdAt) }}
              </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0 max-md:gap-2">
              <span
                :class="[
                  'px-3 py-1 rounded text-sm font-medium max-md:px-2 max-md:py-2 max-md:text-xs',
                  feedback?.status
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800',
                ]"
              >
                {{ feedback?.status ? $t("resolved") : $t("pending") }}
              </span>
              <button
                @click="handleClose"
                class="text-gray-400 lg:hover:text-gray-600 text-xl max-md:text-lg"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-md:p-3 max-md:space-y-3"
          ref="conversationArea"
        >
          <div class="flex justify-start">
            <div
              class="flex max-w-[70%] max-[400px]:max-w-full gap-3 w-full max-md:gap-2"
            >
              <div
                class="w-8 h-8 max-[350px]:w-6 max-[350px]:h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 max-md:w-7 max-md:h-7"
              >
                <i class="fas fa-user max-md:text-xs"></i>
              </div>
              <div
                class="max-w-[70%] p-3 rounded-lg bg-blue-600 text-white max-md:p-2"
              >
                <div
                  class="flex flex-wrap justify-between gap-2 max-sm:gap-1 items-center mb-1"
                >
                  <span
                    class="text-xs opacity-75 font-medium max-md:text-[10px]"
                  >
                    {{ feedback?.username }}
                  </span>
                  <span class="text-xs opacity-60 max-md:text-[10px]">
                    {{ formatDate(feedback?.createdAt) }}
                  </span>
                </div>
                <div
                  class="text-xs opacity-75 mb-2 max-md:text-[10px] max-md:mb-1"
                >
                  {{ $t("original_issue") }}
                </div>
                <div
                  class="text-sm whitespace-pre-wrap break-words word-wrap max-md:text-xs"
                >
                  {{ feedback?.description }}
                </div>
                <div
                  v-if="feedback?.images && feedback.images.length > 0"
                  class="mt-2 flex gap-2 flex-wrap items-start max-md:mt-1.5 max-md:gap-1.5"
                >
                  <img
                    v-for="(image, index) in feedback.images"
                    :key="index"
                    :src="image"
                    class="w-12 h-12 object-cover rounded border border-white/20 cursor-pointer max-md:w-10 max-md:h-10"
                    alt="Issue image"
                    @click="openImagePreview(image)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="(message, index) in feedback?.conversation || []"
            :key="index"
            :class="[
              'flex gap-3 max-md:gap-2',
              message.sender === 'agent' ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              v-if="message.sender === 'customer'"
              class="w-8 h-8 max-[350px]:w-6 max-[350px]:h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 max-md:w-7 max-md:h-7"
            >
              <i class="fas fa-user max-md:text-xs"></i>
            </div>

            <div
              :class="[
                'max-w-[70%] p-3 rounded-lg max-md:p-2',
                message.sender === 'agent'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-800 border',
              ]"
            >
              <div
                class="flex flex-wrap justify-between gap-2 max-sm:gap-1 items-center mb-1"
              >
                <span class="text-xs opacity-75 font-medium max-md:text-[10px]">
                  {{
                    message.sender === "agent"
                      ? `You (${message.senderName})`
                      : message.senderName
                  }}
                </span>
                <span class="text-xs opacity-60 max-md:text-[10px]">
                  {{ formatDate(message.createdAt) }}
                </span>
              </div>
              <div
                class="text-sm whitespace-pre-wrap break-words word-wrap max-md:text-xs"
              >
                {{ message.message }}
              </div>
              <div
                v-if="message.attachments && message.attachments.length > 0"
                class="mt-2 flex gap-2 flex-wrap items-start max-md:mt-1.5 max-md:gap-1.5"
              >
                <img
                  v-for="(attachment, attIndex) in message.attachments"
                  :key="attIndex"
                  :src="attachment"
                  class="w-12 h-12 object-cover rounded border cursor-pointer max-md:w-10 max-md:h-10"
                  :class="
                    message.sender === 'agent'
                      ? 'border-white/20'
                      : 'border-gray-200'
                  "
                  alt="Attachment"
                  @click="openImagePreview(attachment)"
                />
              </div>
            </div>

            <div
              v-if="message.sender === 'agent'"
              class="w-8 h-8 max-[350px]:w-6 max-[350px]:h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 max-md:w-7 max-md:h-7"
            >
              <i class="fas fa-user-tie max-md:text-xs"></i>
            </div>
          </div>

          <div
            v-if="!feedback?.conversation || feedback.conversation.length === 0"
            class="text-center py-4 max-md:py-3"
          >
            <div class="text-gray-500 text-sm max-md:text-xs">
              {{ $t("no_replies") }}
            </div>
          </div>
        </div>

        <div
          v-if="!feedback?.status"
          class="p-4 border-t bg-white flex-shrink-0 max-md:p-3"
        >
          <div class="space-y-3 max-md:space-y-2">
            <div class="flex gap-3 max-md:gap-2 max-md:flex-col">
              <textarea
                v-model="newMessage"
                rows="3"
                class="flex-1 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none max-md:px-2 max-md:py-1.5 max-md:text-xs"
                :placeholder="$t('type_reply')"
                @keydown.ctrl.enter="sendReply"
                @keydown.meta.enter="sendReply"
              ></textarea>
              <div
                class="flex flex-col gap-2 max-md:flex-row max-md:justify-end"
              >
                <input
                  type="file"
                  ref="messageFileInput"
                  @change="handleMessageFiles"
                  multiple
                  accept="image/*"
                  class="hidden"
                />
                <button
                  @click="$refs.messageFileInput.click()"
                  class="px-3 py-2 bg-gray-500 lg:hover:bg-gray-600 text-white rounded transition-colors duration-200 max-md:px-4 max-md:text-sm"
                  :title="$t('attach_images')"
                >
                  <i class="fas fa-paperclip"></i>
                </button>
                <button
                  @click="sendReply"
                  :disabled="!newMessage.trim() || sendingMessage"
                  class="px-6 py-2 bg-indigo-600 lg:hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 max-md:px-4 max-md:text-sm"
                >
                  <span v-if="sendingMessage">
                    <i class="fas fa-spinner fa-spin"></i>
                  </span>
                  <span v-else>
                    <i class="fas fa-paper-plane"></i>
                  </span>
                </button>
              </div>
            </div>

            <!-- File Previews -->
            <div
              v-if="messageAttachments.length > 0"
              class="flex flex-wrap gap-2 max-md:gap-1.5"
            >
              <div
                v-for="(file, index) in messageAttachments"
                :key="index"
                class="relative"
              >
                <img
                  :src="messageAttachmentPreviews[index]"
                  class="w-16 h-16 object-cover rounded border border-gray-300 max-md:w-12 max-md:h-12"
                  alt="Preview"
                />
                <button
                  @click="removeMessageFile(index)"
                  class="absolute -top-2 -right-2 bg-red-500 lg:hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white max-md:w-4 max-md:h-4 max-md:-top-1 max-md:-right-1"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="text-gray-500 text-xs max-md:text-[10px]">
              Press Ctrl+Enter to send quickly
            </div>
          </div>
        </div>

        <div
          v-else
          class="p-4 border-t bg-gray-50 text-center flex-shrink-0 max-md:p-3"
        >
          <div class="text-green-600 max-md:text-sm max-sm:text-xs">
            <i class="fas fa-check-circle mr-2"></i>
            {{ $t("ticket_resolved_closed") }}
          </div>
        </div>
      </div>

      <div
        v-if="showImagePreview"
        class="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 max-md:p-2"
        @click="closeImagePreview"
      >
        <div
          class="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center"
        >
          <img
            :src="previewImageUrl"
            class="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            alt="Preview"
            @click.stop
          />
          <button
            @click="closeImagePreview"
            class="absolute top-4 right-4 bg-black/50 lg:hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl transition-colors duration-200 max-md:w-8 max-md:h-8 max-md:text-base max-md:top-2 max-md:right-2"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div></div
  ></Teleport>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  feedbackId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["close", "message-sent"]);
const isPageLoading = ref(true);
const { get, post } = useApiEndpoint();

const feedback = ref(null);

const newMessage = ref("");
const sendingMessage = ref(false);
const messageAttachments = ref([]);
const messageAttachmentPreviews = ref([]);
const showImagePreview = ref(false);
const previewImageUrl = ref("");

const conversationArea = ref(null);

// Watch for modal show/hide
watch(
  () => props.show,
  (newShow) => {
    if (newShow && props.feedbackId) {
      loadChatData();
    }
  }
);

// Watch for feedback changes to scroll to bottom
watch(
  () => feedback.value?.conversation,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true }
);

const handleClose = () => {
  newMessage.value = "";
  messageAttachments.value = [];
  messageAttachmentPreviews.value = [];
  showImagePreview.value = false;
  previewImageUrl.value = "";
  feedback.value = null;
  emit("close");
};

const loadChatData = async () => {
  if (!props.feedbackId) return;

  isPageLoading.value = true;
  try {
    const { data } = await get(`feedbacks/${props.feedbackId}/viewchat`);
    if (data.success) {
      feedback.value = data.data.feedback;
      nextTick(() => {
        scrollToBottom();
      });
    }
  } catch (error) {
    console.error("Error loading chat:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load conversation",
    });
  } finally {
    isPageLoading.value = false;
  }
};

const scrollToBottom = () => {
  if (conversationArea.value) {
    conversationArea.value.scrollTop = conversationArea.value.scrollHeight;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openImagePreview = (imageUrl) => {
  previewImageUrl.value = imageUrl;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = "";
};

const handleMessageFiles = (event) => {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    if (!file.type.includes("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Only image files are allowed",
      });
      return;
    }

    messageAttachments.value.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      messageAttachmentPreviews.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });

  event.target.value = "";
};

const removeMessageFile = (index) => {
  messageAttachments.value.splice(index, 1);
  messageAttachmentPreviews.value.splice(index, 1);
};

const sendReply = async () => {
  if (!newMessage.value.trim() && messageAttachments.value.length === 0) return;

  sendingMessage.value = true;
  try {
    const formData = new FormData();
    formData.append(
      "message",
      newMessage.value.trim() || "📎 Image attachment"
    );

    messageAttachments.value.forEach((file) => {
      formData.append("images", file);
    });

    const { data } = await post(
      `feedbacks/${props.feedbackId}/reply`,
      formData,
      true
    );

    if (data.success) {
      newMessage.value = "";
      messageAttachments.value = [];
      messageAttachmentPreviews.value = [];

      // Reload chat data to show new message
      await loadChatData();

      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });

      emit("message-sent");
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error sending reply:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    sendingMessage.value = false;
  }
};
</script>
