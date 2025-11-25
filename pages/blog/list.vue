<template>
  <div>
    <PageLoading v-if="isPageLoading" />
    <!-- Header Section -->
    <div
      class="flex items-center justify-between mb-6 max-md:mb-4 max-md:flex-col max-md:items-start max-md:gap-4"
    >
      <div class="flex items-center gap-4 max-md:gap-3">
        <div class="w-2 h-8 bg-indigo-600 rounded-full max-md:h-6"></div>
        <h1 class="text-2xl font-semibold text-gray-800 max-md:text-xl">
          {{ $t("blog_list") }}
        </h1>
      </div>
      <BaseCreateButton @click="handleCreate" />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="flex items-center justify-end p-4 border-b max-md:p-3">
        <div class="flex items-center gap-4 max-md:w-full">
          <BaseSearch
            v-model="searchQuery"
            :placeholder="$t('search')"
            @type-change="handleTypeChange"
          />
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-nowrap">
          <!-- ... table headers ... -->
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="blog in paginatedBlogs"
              :key="blog._id"
              class="lg:hover:bg-gray-50"
            >
              <td class="px-6 py-4 max-md:px-3 max-md:py-3 min-w-[100px]">
                <img
                  :src="blog.image"
                  alt="Blog"
                  class="w-full max-w-[150px] h-auto object-cover rounded-lg max-md:w-16"
                />
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="space-y-1">
                  <div class="text-xs text-gray-500">{{ $t("title") }}:</div>
                  <div class="text-sm text-gray-700 max-md:text-xs">
                    {{ blog.title }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div class="space-y-1">
                  <div class="text-xs text-gray-500">
                    {{ $t("description") }}:
                  </div>
                  <div class="text-sm text-gray-700 max-md:text-xs">
                    {{ truncateText(blog.description, 50) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center gap-2 max-md:gap-1.5 max-md:flex-col max-md:items-start"
                >
                  <BaseToggleSwitch
                    v-model="blog.isVisible"
                    @update:modelValue="() => handleVisibilityChange(blog)"
                  />
                  <span class="text-sm text-gray-600 max-md:text-xs">
                    {{ blog.isVisible ? $t("visible") : $t("hidden") }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 max-md:px-3 max-md:py-3">
                <div
                  class="flex items-center gap-2 max-md:gap-1 max-md:flex-col"
                >
                  <button
                    @click="handleEdit(blog)"
                    class="px-3 py-1 bg-indigo-600 text-white rounded lg:hover:bg-indigo-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("edit") }}
                  </button>
                  <LoadingButton
                    :loading="isButtonLoading[blog._id]"
                    @click="handleDelete(blog)"
                    class="px-3 py-1 bg-red-600 text-white rounded lg:hover:bg-red-500 text-md max-md:px-2 max-md:py-2 max-md:text-xs max-md:w-full"
                  >
                    {{ $t("delete") }}
                  </LoadingButton>
                </div>
              </td>
            </tr>
            <tr
              v-if="paginatedBlogs.length === 0"
              class="h-[400px] max-md:h-[300px]"
            >
              <td
                colspan="5"
                class="px-6 py-4 text-center text-gray-500 max-md:px-3 max-md:text-sm"
              >
                <div class="flex flex-col gap-8 items-center max-md:gap-4">
                  <img
                    src="/images/empty2.png"
                    alt="Empty State"
                    class="w-32 h-auto opacity-80 max-md:w-24"
                  />
                  {{ $t("no_blogs_found") }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <BasePagination
        v-if="paginatedBlogs.length > 0"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

    <!-- Blog Modal -->
    <BlogModal
      v-model:show="showBlogModal"
      :initial-data="editingBlog"
      @success="fetchBlogs"
    />
  </div>
</template>

<script setup>
const isButtonLoading = ref({});
const isPageLoading = ref(true);
const tableHeaders = [
  { key: "image", label: "Image", labelCN: "图片" },
  { key: "title", label: "Title", labelCN: "标题" },
  { key: "description", label: "Description", labelCN: "描述" },
  { key: "status", label: "Status", labelCN: "状态" },
  { key: "actions", label: "Actions", labelCN: "操作" },
];

const { get, post, put, delete: del, patch } = useApiEndpoint();
const blogs = ref([]);
const showBlogModal = ref(false);
const editingBlog = ref(null);
const imageFile = ref(null);
const imagePreview = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const searchQuery = ref("");
const dateRange = ref({
  startDate: null,
  endDate: null,
});
const dateFilterRef = ref(null);
const totalItems = computed(() => blogs.value.length);

const handleCreate = () => {
  editingBlog.value = null;
  showBlogModal.value = true;
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchBlogs();
};

const handleEdit = (blog) => {
  editingBlog.value = blog;
  showBlogModal.value = true;
};

const handleReset = () => {
  dateFilterRef.value?.handleReset();
  searchQuery.value = "";
  currentPage.value = 1;
  fetchBlogs();
};

const blogForm = ref({
  title: "",
  description: "",
  content: "",
  image: "",
  isVisible: true,
});

const fetchBlogs = async () => {
  try {
    const { data } = await get("allblogs");
    if (data.success) {
      blogs.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load blogs",
    });
  }
};
const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const filteredBlogs = computed(() => {
  let filtered = blogs.value;
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (blog) =>
        blog.title.toLowerCase().includes(term) ||
        blog.description.toLowerCase().includes(term)
    );
  }
  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredBlogs.value.length / itemsPerPage.value) || 1;
});

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredBlogs.value.slice(start, end).map((blogs, index) => ({
    ...blogs,
  }));
});

const truncateText = (text, length) => {
  if (!text) return "";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const handleTypeChange = () => {
  currentPage.value = 1;
};

const resetForm = () => {
  blogForm.value = {
    title: "",
    description: "",
    content: "",
    image: "",
    isVisible: true,
  };
  imagePreview.value = null;
  imageFile.value = null;
};

const submitBlog = async () => {
  try {
    const formData = new FormData();
    formData.append("title", blogForm.value.title);
    formData.append("description", blogForm.value.description);
    formData.append("content", blogForm.value.content);
    formData.append("isVisible", blogForm.value.isVisible);
    if (imageFile.value) {
      formData.append("image", imageFile.value);
    }
    let response;
    if (editingBlog.value) {
      response = await put(`blogs/${editingBlog.value._id}`, formData);
    } else {
      response = await post("blogs", formData);
    }
    if (response.data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: response.data.message[$locale.value] || response.data.message.en,
        timer: 1500,
      });
      closeForm();
      fetchBlogs();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: response.data.message[$locale.value] || response.data.message.en,
      });
    }
  } catch (error) {
    console.error("Error submitting blog:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const handleVisibilityChange = async (blog) => {
  try {
    const { data } = await patch(`blogs/${blog._id}/visibility`, {
      isVisible: blog.isVisible,
    });
    if (data.success) {
      await Swal.fire({
        icon: "success",
        title: $t("success"),
        text: data.message[$locale.value] || data.message.en,
        timer: 1500,
      });
      await fetchBlogs();
    } else {
      await Swal.fire({
        icon: "info",
        title: $t("info"),
        text: data.message[$locale.value] || data.message.en,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    blog.isVisible = !blog.isVisible;
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  }
};

const handleDelete = async (blog) => {
  isButtonLoading.value[blog._id] = true;
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
      const { data } = await del(`blogs/${blog._id}`);
      if (data.success) {
        await Swal.fire({
          icon: "success",
          title: $t("success"),
          text: data.message[$locale.value] || data.message.en,
          timer: 1500,
        });
        await fetchBlogs();
      } else {
        await Swal.fire({
          icon: "info",
          title: $t("info"),
          text: data.message[$locale.value] || data.message.en,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    await Swal.fire({
      icon: "error",
      title: $t("error"),
      text:
        error.response?.data?.message?.[$locale.value] ||
        error.response?.data?.message?.en ||
        $t("network_error"),
    });
  } finally {
    isButtonLoading.value[blog._id] = false;
  }
};

const closeForm = () => {
  showBlogModal.value = false;
  editingBlog.value = null;
  resetForm();
};

watch(searchQuery, (newValue) => {
  currentPage.value = 1;
});

onMounted(async () => {
  await fetchBlogs();
  isPageLoading.value = false;
});

useHead({
  title: "Money System | Blog",
});
</script>
