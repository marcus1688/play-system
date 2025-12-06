<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <div
      class="flex items-center justify-between mb-6 max-lg:justify-end max-md:mb-4 max-md:flex-col max-md:items-stretch max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-lg:hidden max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("edit_seo_content") }}: {{ page?.pageType }}
        </h1>
      </div>
      <div class="flex gap-4 max-md:gap-2 max-md:flex-col">
        <button
          @click="addNewBlock"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("add_new_block") }}
        </button>
        <NuxtLinkLocale
          to="/seo"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg lg:hover:bg-gray-500 text-center max-md:px-3 max-md:py-1.5 max-md:text-sm"
        >
          {{ $t("back") }}
        </NuxtLinkLocale>
      </div>
    </div>

    <div class="mb-4 flex justify-end max-md:mb-3">
      <BaseSearch v-model="searchQuery" :placeholder="$t('search_content')" />
    </div>

    <!-- Content Blocks -->
    <div v-if="!isPageLoading">
      <div v-if="paginatedBlocks.length" class="space-y-6 max-md:space-y-4">
        <TransitionGroup name="content-block">
          <div
            v-for="(block, index) in paginatedBlocks"
            :key="block._id || index"
            class="bg-white rounded-lg shadow p-6 relative max-md:p-4"
          >
            <div class="flex justify-end">
              <span class="text-red-500 text-xs max-md:text-[10px]"
                >**{{ $t("image_size_limit") }}**</span
              >
            </div>
            <TiptapEditor
              v-model="blockContentWrapper[index]"
              :language-config="[
                { code: 'en', name: 'English', field: 'content' },
                { code: 'zh', name: '中文', field: 'contentCN' },
              ]"
              :label="$t('content_label')"
              :placeholder="$t('start_typing')"
              :upload-image="true"
            />
            <div
              class="flex justify-end mt-4 gap-2 max-md:mt-3 max-md:gap-1.5 max-md:flex-col"
            >
              <template v-if="block._id">
                <LoadingButton
                  :loading="isButtonLoading[block._id]"
                  @click="handleDeleteBlock(block._id)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg lg:hover:bg-red-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
                >
                  {{ $t("delete") }}
                </LoadingButton>
              </template>
              <template v-else>
                <button
                  @click="removeBlock(index)"
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg lg:hover:bg-orange-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
                >
                  {{ $t("remove") }}
                </button>
              </template>
              <LoadingButton
                :loading="savingStates.get(block._id || index)"
                @click="saveBlock(block, index)"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg lg:hover:bg-indigo-500 max-md:px-3 max-md:py-1.5 max-md:text-sm max-md:w-full"
              >
                {{ $t("save") }}
              </LoadingButton>
            </div>
          </div>
        </TransitionGroup>
        <BasePagination
          v-if="paginatedBlocks.length !== 0"
          v-model="currentPage"
          :totalPages="totalPages"
        />
      </div>
      <div
        v-else
        class="flex flex-col items-center justify-center space-y-4 mt-24 h-[60vh] max-md:mt-12 max-md:h-[50vh] max-md:space-y-3"
      >
        <img
          src="/images/empty2.png"
          alt="Empty State"
          class="w-32 h-auto opacity-80 max-md:w-24"
        />
        <p
          class="text-gray-500 text-lg max-md:text-base max-md:text-center max-md:px-4"
        >
          {{ $t("no_content_blocks") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const isButtonLoading = ref({});
const route = useRoute();
const router = useRouter();
const { get, post, put, delete: del } = useApiEndpoint();
const isPageLoading = ref(true);
const savingStates = ref(new Map());
const page = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(5);
const searchQuery = ref("");
const blockContentWrapper = ref([]);

const fetchPage = async () => {
  try {
    const { data } = await get(`seo-pages/${route.params.id}`);
    if (data.success) {
      page.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching page:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load page content",
    });
    router.push("/seo");
  } finally {
    isPageLoading.value = false;
  }
};

const saveContent = async () => {
  try {
    isSaving.value = true;
    if (!page.value.contentBlocks.length) {
      throw new Error("At least one content block is required");
    }
    const errors = validateBlocks(page.value.contentBlocks);
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    const { data } = await put(`seo-pages/${page.value._id}`, page.value);
    console.log(data);
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchPage();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving content:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isSaving.value = false;
  }
};

const addNewBlock = async () => {
  const hasUnsavedBlocks = page.value.contentBlocks.some((block) => !block._id);

  if (hasUnsavedBlocks) {
    await Swal.fire({
      icon: "warning",
      title: $t("unsaved_changes"),
      text: $t("please_save_block_first"),
      confirmButtonColor: "#3085d6",
    });
    return;
  }

  page.value.contentBlocks.forEach((block) => {
    block.order += 1;
  });

  const newBlock = {
    content: "",
    contentCN: "",
    order: 1,
  };

  page.value.contentBlocks.unshift(newBlock);
  blockContentWrapper.value.unshift({
    content: "",
    contentCN: "",
  });

  resetFilters();
};

const removeBlock = (index) => {
  page.value.contentBlocks.splice(index, 1);
  page.value.contentBlocks.forEach((block, idx) => {
    block.order = idx + 1;
  });
  blockContentWrapper.value.splice(index, 1);
};
const handleDeleteBlock = async (blockId) => {
  isButtonLoading.value[blockId] = true;
  try {
    const result = await Swal.fire({
      title: $t("delete_confirmation"),
      text: $t("delete_warning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: $t("confirm_delete"),
      cancelButtonText: $t("cancel"),
    });

    if (result.isConfirmed) {
      const { data } = await del(
        `seo-pages/${page.value._id}/blocks/${blockId}`
      );
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        resetFilters();
        await fetchPage();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error deleting block:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value[blockId] = false;
  }
};

const saveBlock = async (block, index) => {
  try {
    savingStates.value.set(block._id || index, true);
    if (!block.content?.trim() && !block.contentCN?.trim()) {
      throw new Error("At least one language content is required");
    }
    let result;
    if (block._id) {
      result = await put(`seo-pages/${page.value._id}/blocks/${block._id}`, {
        content: block.content,
        contentCN: block.contentCN,
        order: block.order,
      });
    } else {
      result = await post(`seo-pages/${page.value._id}/blocks`, {
        content: block.content,
        contentCN: block.contentCN,
        order: index + 1,
      });
    }
    if (result.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: result.data.message[$locale.value] || result.data.message.en,
        timer: 1500,
      });
      resetFilters();
      await fetchPage();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: result.data.message[$locale.value] || result.data.message.en,
      });
    }
  } catch (error) {
    console.error("Error saving block:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    savingStates.value.delete(block._id || index);
  }
};

const validateBlocks = (blocks) => {
  const errors = [];
  blocks.forEach((block, index) => {
    if (!block.content?.trim()) {
      errors.push(`Block ${index + 1}: Content is required`);
    }
  });
  return errors;
};

const filteredBlocks = computed(() => {
  let filtered = page.value?.contentBlocks || [];
  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (block) =>
        block.content?.toLowerCase().includes(searchTerm) ||
        block.contentCN?.toLowerCase().includes(searchTerm)
    );
  }
  return filtered;
});

const paginatedBlocks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBlocks.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil((filteredBlocks.value?.length || 0) / itemsPerPage.value)
);

const resetFilters = () => {
  searchQuery.value = "";
  currentPage.value = 1;
};

onMounted(() => {
  fetchPage();
});

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

watch(
  () => page.value?.contentBlocks,
  (newBlocks) => {
    if (newBlocks) {
      blockContentWrapper.value = newBlocks.map((block) => ({
        content: block.content || "",
        contentCN: block.contentCN || "",
      }));
    }
  },
  { immediate: true }
);

watch(
  blockContentWrapper,
  (newWrappers) => {
    if (newWrappers.length && page.value?.contentBlocks) {
      newWrappers.forEach((wrapper, index) => {
        if (index < page.value.contentBlocks.length) {
          page.value.contentBlocks[index].content = wrapper.content;
          page.value.contentBlocks[index].contentCN = wrapper.contentCN;
        }
      });
    }
  },
  { deep: true }
);

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchPage();
    }
  }
);

useHead({
  title: "Play System | SEO",
});
</script>

<style scoped></style>
