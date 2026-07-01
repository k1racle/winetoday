<script setup lang="ts">
const { getSiteSettings } = useApi();
const { data: siteSettings } = await useAsyncData('footer-site-settings', () =>
  getSiteSettings().catch(() => null),
);
const { headerCategories } = useHeaderCategories();

const socialLinks = computed(() => {
  const links = siteSettings.value?.socialLinks?.links;
  return Array.isArray(links) ? links : [];
});
</script>

<template>
  <footer class="bg-[#0B3D2E] text-white">
    <div class="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div class="grid gap-10 md:grid-cols-3 md:gap-8">
        <!-- Logo + socials -->
        <div class="space-y-6">
          <NuxtLink to="/" class="font-heading text-xl font-bold uppercase tracking-wider">
            Виноделие сегодня
          </NuxtLink>
          <div v-if="socialLinks.length" class="flex flex-wrap gap-4">
            <a
              v-for="link in socialLinks"
              :key="link.href + link.label"
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="text-white/80 transition hover:text-white"
              :aria-label="link.label"
            >
              <SocialIcon :name="link.icon" :label="link.label" :href="link.href" inverted class="h-6 w-6" />
            </a>
          </div>
        </div>

        <!-- Categories -->
        <div>
          <h4 class="mb-5 text-xs font-semibold uppercase tracking-wider text-white/60">
            Рубрики
          </h4>
          <ul class="space-y-3 text-sm font-medium uppercase tracking-wide">
            <li>
              <NuxtLink to="/news" class="text-white/90 transition hover:text-white">
                Новости
              </NuxtLink>
            </li>
            <li v-for="cat in headerCategories" :key="cat.id">
              <NuxtLink :to="`/category/${cat.slug}`" class="text-white/90 transition hover:text-white">
                {{ cat.name }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/events" class="text-white/90 transition hover:text-white">
                Афиша
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- About -->
        <div>
          <h4 class="mb-5 text-xs font-semibold uppercase tracking-wider text-white/60">
            О нас
          </h4>
          <ul class="space-y-3 text-sm font-medium uppercase tracking-wide">
            <li>
              <NuxtLink to="/legal" class="text-white/90 transition hover:text-white">
                Правовая информация
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy" class="text-white/90 transition hover:text-white">
                Политика в отношении обработки персональных данных
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="border-t border-white/10">
      <div class="mx-auto max-w-7xl px-4 py-5">
        <p class="text-center text-xs text-white/60">
          Все права защищены. Копирование и иное использование материалов возможны только с письменного согласия правообладателя и с обязательным указанием источника.
        </p>
      </div>
    </div>
  </footer>
</template>
