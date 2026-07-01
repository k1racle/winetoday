
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AdminTabs: typeof import("../../components/AdminTabs.vue")['default']
  ArticleCard: typeof import("../../components/ArticleCard.vue")['default']
  AuthDrawer: typeof import("../../components/AuthDrawer.vue")['default']
  ContentBlocks: typeof import("../../components/ContentBlocks.vue")['default']
  ContentDetail: typeof import("../../components/ContentDetail.vue")['default']
  EditorHelpModal: typeof import("../../components/EditorHelpModal.vue")['default']
  EditorPanel: typeof import("../../components/EditorPanel.vue")['default']
  EditorSidebar: typeof import("../../components/EditorSidebar.vue")['default']
  FreshList: typeof import("../../components/FreshList.vue")['default']
  HeroCard: typeof import("../../components/HeroCard.vue")['default']
  NewsThumbCard: typeof import("../../components/NewsThumbCard.vue")['default']
  SidebarByCategory: typeof import("../../components/SidebarByCategory.vue")['default']
  SiteFooter: typeof import("../../components/SiteFooter.vue")['default']
  SiteHeader: typeof import("../../components/SiteHeader.vue")['default']
  SocialIcon: typeof import("../../components/SocialIcon.vue")['default']
  VideoFeatureCard: typeof import("../../components/VideoFeatureCard.vue")['default']
  VideoThumb: typeof import("../../components/VideoThumb.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
  NuxtPicture: typeof import("../../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAdminTabs: LazyComponent<typeof import("../../components/AdminTabs.vue")['default']>
  LazyArticleCard: LazyComponent<typeof import("../../components/ArticleCard.vue")['default']>
  LazyAuthDrawer: LazyComponent<typeof import("../../components/AuthDrawer.vue")['default']>
  LazyContentBlocks: LazyComponent<typeof import("../../components/ContentBlocks.vue")['default']>
  LazyContentDetail: LazyComponent<typeof import("../../components/ContentDetail.vue")['default']>
  LazyEditorHelpModal: LazyComponent<typeof import("../../components/EditorHelpModal.vue")['default']>
  LazyEditorPanel: LazyComponent<typeof import("../../components/EditorPanel.vue")['default']>
  LazyEditorSidebar: LazyComponent<typeof import("../../components/EditorSidebar.vue")['default']>
  LazyFreshList: LazyComponent<typeof import("../../components/FreshList.vue")['default']>
  LazyHeroCard: LazyComponent<typeof import("../../components/HeroCard.vue")['default']>
  LazyNewsThumbCard: LazyComponent<typeof import("../../components/NewsThumbCard.vue")['default']>
  LazySidebarByCategory: LazyComponent<typeof import("../../components/SidebarByCategory.vue")['default']>
  LazySiteFooter: LazyComponent<typeof import("../../components/SiteFooter.vue")['default']>
  LazySiteHeader: LazyComponent<typeof import("../../components/SiteHeader.vue")['default']>
  LazySocialIcon: LazyComponent<typeof import("../../components/SocialIcon.vue")['default']>
  LazyVideoFeatureCard: LazyComponent<typeof import("../../components/VideoFeatureCard.vue")['default']>
  LazyVideoThumb: LazyComponent<typeof import("../../components/VideoThumb.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
