<script setup lang="ts">
const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <CmsSidebar v-model="sidebarOpen" />

    <div class="lg:pl-[300px]">
      <CmsHeader :sidebar-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
      <main class="px-4 py-6 lg:px-8">
        <div class="mx-auto max-w-[1600px]">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
