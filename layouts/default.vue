<template>
  <ClientOnly>
    <div v-if="!isLoginPage">
      <UserInteractionModal v-model="showInteractionModal" />
      <MenuBar />
      <div
        :class="[
          'fixed inset-0 flex flex-col transition-all duration-300',
          menuOpen ? 'lg:left-[250px]' : 'lg:left-[70px]',
          'max-lg:left-0',
        ]"
      >
        <div class="flex-shrink-0 z-30">
          <Header />
        </div>
        <div class="flex-1 overflow-y-auto bg-[#eef0f8]">
          <div class="p-6 max-md:p-4 min-h-full">
            <NuxtPage class="fade-in" />
          </div>
        </div>
      </div>
      <div
        v-if="menuOpen"
        class="fixed inset-0 bg-black/50 z-30 lg:hidden"
        @click="toggleMenu"
      />
    </div>
    <div v-else>
      <NuxtPage class="fade-in" />
    </div>
  </ClientOnly>
</template>

<script setup>
const showInteractionModal = ref(true);
const menuOpen = useState("menuOpen", () => true);
const route = useRoute();

const isLoginPage = computed(() => {
  return route.path === "/login" || route.path === "/whatsapp";
});
</script>

<style scoped></style>
