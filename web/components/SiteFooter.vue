<script setup lang="ts">
const { siteSettings } = useSharedSiteSettings();
const { headerCategories } = useHeaderCategories();
const { subscribeNewsletter } = useApi();

const socialLinks = computed(() => {
  const links = siteSettings.value?.socialLinks?.links;
  return Array.isArray(links) ? links : [];
});

const subscribeEmail = ref('');
const subscribeLoading = ref(false);
const subscribeSuccess = ref('');
const subscribeError = ref('');

async function onSubscribe() {
  const email = subscribeEmail.value.trim();
  if (!email || subscribeLoading.value) return;
  subscribeLoading.value = true;
  subscribeSuccess.value = '';
  subscribeError.value = '';
  try {
    await subscribeNewsletter(email);
    subscribeSuccess.value = 'Вы подписаны на рассылку';
    subscribeEmail.value = '';
  } catch (err: any) {
    subscribeError.value = err?.data?.message || err?.message || 'Не удалось оформить подписку';
  } finally {
    subscribeLoading.value = false;
  }
}
</script>

<template>
  <footer class="bg-[#0B1A25] text-white">
    <div class="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div class="grid gap-10 md:grid-cols-3 md:gap-8">
        <!-- Logo -->
        <div class="max-w-[240px] md:max-w-[280px]">
          <NuxtLink to="/" class="block">
            <img
              src="/logo-footer.svg"
              alt="Виноделие Сегодня"
              class="h-24 w-auto max-w-full md:h-28"
            >
          </NuxtLink>

          <div class="mt-[30px] rounded-lg border border-white/10 bg-white/5 p-4">
            <a
              href="mailto:info@winemaking-today.ru"
              class="group block"
            >
              <span class="block text-[10px] font-bold uppercase tracking-wider text-white/50">
                По вопросам сотрудничества
              </span>
              <span class="block text-sm font-medium text-white/90 transition group-hover:text-accent">
                info@winemaking-today.ru
              </span>
            </a>
          </div>

          <div class="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-white/50">
              Подписка на рассылку
            </span>
            <form class="mt-3" @submit.prevent="onSubscribe">
              <input
                v-model="subscribeEmail"
                type="email"
                required
                placeholder="Ваш e-mail"
                class="w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition placeholder:text-white/40 focus:border-accent"
              >
              <button
                type="submit"
                :disabled="subscribeLoading"
                class="mt-2 w-full bg-accent px-3 py-2 text-sm font-bold text-black transition hover:bg-accent/90 disabled:opacity-50"
              >
                {{ subscribeLoading ? 'Отправка...' : 'Подписаться' }}
              </button>
            </form>
            <p v-if="subscribeSuccess" class="mt-2 text-xs text-green-400">{{ subscribeSuccess }}</p>
            <p v-if="subscribeError" class="mt-2 text-xs text-red-400">{{ subscribeError }}</p>
          </div>
        </div>

        <!-- Categories -->
        <div>
          <h4 class="mb-5 text-xs font-bold uppercase tracking-wider text-white">
            Рубрики
          </h4>
          <ul class="space-y-3 text-sm font-normal">
            <li>
              <NuxtLink to="/news" class="text-white/70 transition hover:text-white">
                Новости
              </NuxtLink>
            </li>
            <li v-for="cat in headerCategories" :key="cat.id">
              <NuxtLink :to="`/category/${cat.slug}`" class="text-white/70 transition hover:text-white">
                {{ cat.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- About + socials -->
        <div>
          <h4 class="mb-5 text-xs font-bold uppercase tracking-wider text-white">
            О нас
          </h4>
          <ul class="space-y-3 text-sm font-normal">
            <li>
              <NuxtLink to="/legal" class="text-white/70 transition hover:text-white">
                Правовая информация
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="text-white/70 transition hover:text-white">
                Политика в отношении обработки персональных данных
              </NuxtLink>
            </li>
          </ul>
          <div v-if="socialLinks.length" class="mt-6 grid grid-cols-4 gap-x-4 gap-y-5">
            <a
              v-for="link in socialLinks"
              :key="link.href + link.label"
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="text-white/70 transition hover:text-white"
              :aria-label="link.label"
            >
              <SocialIcon :name="link.icon" :label="link.label" :href="link.href" variant="white" class="h-8 w-8" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="border-t border-white/10">
      <div class="mx-auto max-w-7xl px-4 py-5">
        <p class="text-xs font-normal text-white/50">
          Все права защищены. Копирование и иное использование материалов возможны только с письменного согласия правообладателя и с обязательным указанием источника.
        </p>
        <p class="mt-2 text-[10px] font-normal leading-relaxed text-white/40">
          Instagram, Facebook, WhatsApp принадлежат компании Meta, признанной экстремистской на территории Российской Федерации.
        </p>
      </div>
    </div>
  </footer>
</template>
