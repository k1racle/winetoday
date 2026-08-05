<script setup lang="ts">
const sidebarOpen = ref(false);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
</script>

<template>
  <div class="cms-shell relative min-h-screen overflow-hidden bg-[#07111b] text-foreground">
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(204,244,79,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(84,135,255,0.12),transparent_26%),linear-gradient(180deg,#07111b_0%,#0a1520_100%)]" />
    <CmsSidebar v-model="sidebarOpen" />

    <div class="relative lg:pl-[320px]">
      <CmsHeader :sidebar-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
      <main class="px-4 py-5 lg:px-8 lg:py-8">
        <div class="w-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.cms-shell :deep(main a[href="/account"]),
.cms-shell :deep(main a[href="/account/admin"]),
.cms-shell :deep(main a[href="/account/admin/authors"]) {
  display: none !important;
}

.cms-shell :deep(main .admin-container),
.cms-shell :deep(main .account-admin-page),
.cms-shell :deep(main .account-page) {
  background: transparent !important;
}

.cms-shell :deep(main > div > .border),
.cms-shell :deep(main section.border),
.cms-shell :deep(main .rounded.border),
.cms-shell :deep(main .rounded-lg.border),
.cms-shell :deep(main .rounded-xl.border),
.cms-shell :deep(main .rounded-2xl.border) {
  border-color: rgb(255 255 255 / 0.09);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.16);
}

.cms-shell :deep(main table) {
  width: 100%;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 24px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.04), rgb(255 255 255 / 0.02));
}

.cms-shell :deep(main thead) {
  background: rgb(255 255 255 / 0.05);
}

.cms-shell :deep(main th) {
  padding: 14px 18px;
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgb(255 255 255 / 0.52);
}

.cms-shell :deep(main td) {
  padding: 14px 18px;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
  vertical-align: top;
}

.cms-shell :deep(main tbody tr:last-child td) {
  border-bottom: 0;
}

.cms-shell :deep(main tbody tr:hover) {
  background: rgb(255 255 255 / 0.03);
}

.cms-shell :deep(main input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color'])),
.cms-shell :deep(main select),
.cms-shell :deep(main textarea) {
  min-height: 46px;
  border-radius: 16px;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(6 16 25 / 0.9);
  color: inherit;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.03);
}

.cms-shell :deep(main textarea) {
  min-height: 120px;
}

.cms-shell :deep(main input:focus),
.cms-shell :deep(main select:focus),
.cms-shell :deep(main textarea:focus) {
  border-color: hsl(var(--accent) / 0.45);
  outline: none;
  box-shadow: 0 0 0 3px rgb(204 244 79 / 0.08);
}

.cms-shell :deep(main button),
.cms-shell :deep(main .button),
.cms-shell :deep(main [role='button']) {
  border-radius: 16px;
}

.cms-shell :deep(main .ProseMirror) {
  min-height: 260px;
  border-radius: 0 0 18px 18px;
  background: rgb(6 16 25 / 0.85);
}

.cms-shell :deep(main .tiptap-toolbar),
.cms-shell :deep(main .editor-toolbar) {
  border-color: rgb(255 255 255 / 0.08);
  background: rgb(255 255 255 / 0.04);
}

.cms-shell :deep(main hr) {
  border-color: rgb(255 255 255 / 0.08);
}
</style>
