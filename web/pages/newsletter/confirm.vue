<script setup lang="ts">
const route = useRoute();
const { confirmNewsletter, getNewsletterPreferences } = useApi();

const token = computed(() => String(route.query.token || ''));

const loading = ref(true);
const success = ref(false);
const error = ref('');

onMounted(async () => {
  if (!token.value) {
    loading.value = false;
    error.value = 'Некорректная ссылка подтверждения';
    return;
  }
  try {
    await confirmNewsletter(token.value);
    success.value = true;

    let product = 'newsletter';
    try {
      const prefs = await getNewsletterPreferences(token.value) as { topics?: string[] };
      if (Array.isArray(prefs?.topics) && prefs.topics.length) {
        product = prefs.topics.join(',');
      }
    } catch {
      // предпочтения недоступны — шлём событие с product по умолчанию
    }
    useYm().event('subscription_success', {
      channel: 'email',
      product,
      placement: 'confirm',
      source: 'site',
    });
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Не удалось подтвердить подписку';
  } finally {
    loading.value = false;
  }
});

useSeoMeta({
  title: 'Подтверждение подписки',
  description: 'Подтверждение подписки на рассылку «Виноделие Сегодня».',
  robots: 'noindex,follow',
});

useCanonical();
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <nav class="mb-4 flex items-center gap-2 text-xs font-normal uppercase tracking-wider text-foreground/50">
      <NuxtLink to="/" class="hover:text-foreground">Главная</NuxtLink>
      <span>/</span>
      <span>Подтверждение подписки</span>
    </nav>

    <h1 class="mb-8 font-heading text-3xl font-bold">Подтверждение подписки</h1>

    <div class="rounded-lg border border-foreground/10 bg-foreground/5 p-6">
      <p v-if="loading" class="text-sm text-foreground/60">Подтверждаем подписку...</p>

      <template v-else-if="success">
        <p class="font-heading text-lg font-bold">Подписка подтверждена</p>
        <p class="mt-2 text-sm text-foreground/60">
          Спасибо! Теперь вы будете получать наши письма.
        </p>
        <NuxtLink
          :to="`/newsletter/preferences?token=${token}`"
          class="mt-4 inline-block text-sm text-accent hover:underline"
        >
          Настроить предпочтения
        </NuxtLink>
      </template>

      <template v-else>
        <p class="font-heading text-lg font-bold">Не удалось подтвердить подписку</p>
        <p class="mt-2 text-sm text-red-600">{{ error }}</p>
        <NuxtLink to="/subscribe" class="mt-4 inline-block text-sm text-accent hover:underline">
          Оформить подписку заново
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
