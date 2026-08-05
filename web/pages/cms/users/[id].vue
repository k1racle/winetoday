<script setup lang="ts">
import LegacyUserPage from '~/pages/account/admin/users/[id].vue';

definePageMeta({
  layout: 'cms',
  middleware: 'cms-admin',
});
</script>

<template>
  <LegacyUserPage />
</template>
