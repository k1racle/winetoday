const fetcherCache = new Map<string, ReturnType<typeof $fetch.create>>();

export function useApi() {
  const config = useRuntimeConfig();

  const baseURL = import.meta.server ? config.apiUrl : config.public.apiUrl;

  if (!fetcherCache.has(baseURL)) {
    fetcherCache.set(baseURL, $fetch.create({
      baseURL,
      credentials: 'include',
    }));
  }

  const fetcher = fetcherCache.get(baseURL)!;

  const api = (path: string, opts: any = {}) => {
    if (import.meta.server) {
      opts.headers = { ...useRequestHeaders(['cookie']), ...opts.headers };
    }
    return fetcher(path, opts);
  };

  return {
    api,
    getContent: (query?: Record<string, unknown>) =>
      api('/content', { query }),
    getArticles: (query?: Record<string, unknown>) =>
      api('/articles', { query }),
    getArticle: (slug: string, preview?: boolean) =>
      api(`/articles/${slug}`, { query: preview ? { preview: true } : undefined }),
    getNews: (query?: Record<string, unknown>) =>
      api('/news', { query }),
    getNewsItem: (slug: string, preview?: boolean) =>
      api(`/news/${slug}`, { query: preview ? { preview: true } : undefined }),
    getVideos: (query?: Record<string, unknown>) =>
      api('/videos', { query }),
    getVideo: (slug: string, preview?: boolean) =>
      api(`/videos/${slug}`, { query: preview ? { preview: true } : undefined }),
    getGallery: (slug: string, preview?: boolean) =>
      api(`/galleries/${slug}`, { query: preview ? { preview: true } : undefined }),
    getHomepage: () =>
      api('/homepage'),
    getCategories: () =>
      api('/categories'),
    getTags: () =>
      api('/tags'),
    getLatestByCategory: (limit?: number) =>
      api('/latest-by-category', { query: limit ? { limit } : undefined }),
    getRelated: (type: string, slug: string) =>
      api(`/content/related/${type}/${slug}`),
    getNeighbors: (type: string, slug: string) =>
      api(`/content/neighbors/${type}/${slug}`),
    getAuthorsList: () =>
      api('/authors'),
    getAuthor: (slug: string) =>
      api(`/authors/${slug}`),
    getAuthorContent: (slug: string) =>
      api(`/authors/${slug}/content`),
    getAuthorSubscription: (slug: string) =>
      api(`/authors/${slug}/subscription`),
    subscribeToAuthor: (slug: string) =>
      api(`/authors/${slug}/subscribe`, { method: 'POST', credentials: 'include' }),
    unsubscribeFromAuthor: (slug: string) =>
      api(`/authors/${slug}/unsubscribe`, { method: 'DELETE', credentials: 'include' }),
    updateAuthor: (id: string, body: Record<string, unknown>) =>
      api(`/admin/authors/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    // Admin taxonomy
    getAdminCategories: () =>
      api('/admin/categories', { credentials: 'include' }),
    createCategory: (body: { name: string; slug: string; parentId?: string }) =>
      api('/admin/categories', { method: 'POST', body, credentials: 'include' }),
    updateCategory: (id: string, body: { name?: string; slug?: string; parentId?: string | null }) =>
      api(`/admin/categories/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteCategory: (id: string) =>
      api(`/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' }),
    getAdminTags: () =>
      api('/admin/tags', { credentials: 'include' }),
    createTag: (body: { name: string; slug: string }) =>
      api('/admin/tags', { method: 'POST', body, credentials: 'include' }),
    updateTag: (id: string, body: { name?: string; slug?: string }) =>
      api(`/admin/tags/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteTag: (id: string) =>
      api(`/admin/tags/${id}`, { method: 'DELETE', credentials: 'include' }),
    // Admin social links
    getSocialLinks: () =>
      api('/site-settings/social-links', { credentials: 'include' }),
    updateSocialLinks: (body: { title?: string; links: { label: string; href: string; icon?: string }[] }) =>
      api('/admin/site-settings/social-links', { method: 'PATCH', body, credentials: 'include' }),
    getSiteSettings: () =>
      api('/site-settings'),
    getAdminSiteSettings: () =>
      api('/admin/site-settings', { credentials: 'include' }),
    updateSiteSettings: (body: { winemakersEnabled?: boolean; winemakersHomeConfig?: Record<string, unknown> }) =>
      api('/admin/site-settings', { method: 'PATCH', body, credentials: 'include' }),
    getSiteHeader: () =>
      api('/site-header'),
    getSiteSeo: () =>
      api('/site-seo'),
    getAdminSiteSeo: () =>
      api('/admin/site-seo', { credentials: 'include' }),
    updateSiteSeo: (body: Record<string, unknown>) =>
      api('/admin/site-seo', { method: 'PATCH', body, credentials: 'include' }),
    getAdminSiteHeader: () =>
      api('/admin/site-header', { credentials: 'include' }),
    updateSiteHeader: (body: { lightLogoMediaId?: string; darkLogoMediaId?: string }) =>
      api('/admin/site-header', { method: 'PATCH', body, credentials: 'include' }),
    getStaticPage: (slug: string) =>
      api(`/pages/${slug}`),
    updateStaticPage: (slug: string, body: Record<string, unknown>) =>
      api(`/admin/pages/${slug}`, { method: 'PATCH', body, credentials: 'include' }),
    getAdminHomepage: () =>
      api('/admin/homepage', { credentials: 'include' }),
    updateAdminHomepage: (body: { leadItemIds?: string[]; featuredVideoId?: string | null; leadArchiveCoverMediaId?: string | null }) =>
      api('/admin/homepage', { method: 'PATCH', body, credentials: 'include' }),
    incrementView: (body: Record<string, unknown>) =>
      api('/views/increment', { method: 'POST', body }),
    getReactions: (contentItemId: string, viewerId?: string) =>
      api(`/content/${contentItemId}/reactions`, { query: viewerId ? { viewerId } : undefined }),
    react: (contentItemId: string, type: 'like' | 'dislike', viewerId?: string) =>
      api(`/content/${contentItemId}/react`, { method: 'POST', body: { type, viewerId }, credentials: 'include' }),
    getComments: (contentItemId: string) =>
      api(`/content/${contentItemId}/comments`),
    createComment: (contentItemId: string, body: string) =>
      api(`/content/${contentItemId}/comments`, { method: 'POST', body: { body }, credentials: 'include' }),
    deleteComment: (contentItemId: string, commentId: string) =>
      api(`/content/${contentItemId}/comments/${commentId}`, { method: 'DELETE', credentials: 'include' }),
    login: (body: { login: string; password: string }) =>
      api('/auth/login', { method: 'POST', body }),
    register: (body: { username: string; displayName?: string; email: string; password: string }) =>
      api('/auth/register', { method: 'POST', body }),
    logout: () =>
      api('/auth/logout', { method: 'POST' }),
    me: () =>
      api('/auth/me'),
    refresh: () =>
      api('/auth/refresh', { method: 'POST', credentials: 'include' }),
    getMySubscriptions: () =>
      api('/auth/me/subscriptions', { credentials: 'include' }),
    getMyLikes: () =>
      api('/auth/me/likes', { credentials: 'include' }),
    getMyComments: () =>
      api('/auth/me/comments', { credentials: 'include' }),
    getUsers: () =>
      api('/admin/users', { credentials: 'include' }),
    getUser: (id: string) =>
      api(`/admin/users/${id}`, { credentials: 'include' }),
    createUser: (body: { email: string; username?: string; password: string; role?: string; displayName?: string }) =>
      api('/admin/users', { method: 'POST', body, credentials: 'include' }),
    updateUser: (id: string, body: { email?: string; username?: string; password?: string; role?: string; displayName?: string }) =>
      api(`/admin/users/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteUser: (id: string) =>
      api(`/admin/users/${id}`, { method: 'DELETE', credentials: 'include' }),
    updateUserRole: (id: string, role: string) =>
      api(`/admin/users/${id}/role`, { method: 'PATCH', body: { role }, credentials: 'include' }),
    getMediaById: (id: string) =>
      api(`/media/${id}`, { credentials: 'include' }),
    getMediaList: (query?: { limit?: number; offset?: number; type?: string; search?: string }) =>
      api('/media', { query, credentials: 'include' }),
    getMediaUsage: (id: string) =>
      api(`/media/${id}/usage`, { credentials: 'include' }),
    deleteMedia: (id: string) =>
      api(`/media/${id}`, { method: 'DELETE', credentials: 'include' }),
    uploadMedia: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api('/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    },
    uploadCoverMedia: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api('/media/cover', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    },
    uploadArchiveCoverMedia: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api('/media/archive-cover', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
    },
    saveDraft: (body: Record<string, unknown>) =>
      api('/editor/drafts', { method: 'POST', body, credentials: 'include' }),
    getDraft: (id: string) =>
      api(`/editor/drafts/${id}`, { credentials: 'include' }),
    getEditorMaterials: (query?: Record<string, unknown>) =>
      api('/editor/materials', { query, credentials: 'include' }),
    deleteMaterial: (id: string) =>
      api(`/editor/materials/${id}`, { method: 'DELETE', credentials: 'include' }),
    exportMaterialsCsv: () =>
      api('/editor/materials/export/csv', { credentials: 'include', responseType: 'blob' }),
    getAuthors: () =>
      api('/editor/authors', { credentials: 'include' }),
    getAdminAuthors: () =>
      api('/admin/authors', { credentials: 'include' }),
    createAuthor: (body: { name: string; slug?: string; position?: string; bio?: string; avatarMediaId?: string }) =>
      api('/admin/authors', { method: 'POST', body, credentials: 'include' }),
    getAuthorAnalytics: (id: string) =>
      api(`/admin/authors/${id}/analytics`, { credentials: 'include' }),
    deleteAuthor: (id: string) =>
      api(`/admin/authors/${id}`, { method: 'DELETE', credentials: 'include' }),
    getWinemakers: (query?: Record<string, unknown>) =>
      api('/winemakers', { query }),
    getWinemaker: (slug: string) =>
      api(`/winemakers/${slug}`),
    getAdminWinemakersOptions: () =>
      api('/admin/winemakers/options', { credentials: 'include' }),
    getAdminWinemakersPersons: () =>
      api('/admin/winemakers/persons', { credentials: 'include' }),
    getAdminWinemakersPerson: (id: string) =>
      api(`/admin/winemakers/persons/${id}`, { credentials: 'include' }),
    createAdminWinemakersPerson: (body: Record<string, unknown>) =>
      api('/admin/winemakers/persons', { method: 'POST', body, credentials: 'include' }),
    updateAdminWinemakersPerson: (id: string, body: Record<string, unknown>) =>
      api(`/admin/winemakers/persons/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteAdminWinemakersPerson: (id: string) =>
      api(`/admin/winemakers/persons/${id}`, { method: 'DELETE', credentials: 'include' }),
    getWinesCatalog: (query?: Record<string, unknown>) =>
      api('/wines', { query }),
    getWineCatalogItem: (slug: string) =>
      api(`/wines/${slug}`),
    getAdminWinemakersWines: () =>
      api('/admin/winemakers/wines', { credentials: 'include' }),
    getAdminWinemakersWine: (id: string) =>
      api(`/admin/winemakers/wines/${id}`, { credentials: 'include' }),
    createAdminWinemakersWine: (body: Record<string, unknown>) =>
      api('/admin/winemakers/wines', { method: 'POST', body, credentials: 'include' }),
    updateAdminWinemakersWine: (id: string, body: Record<string, unknown>) =>
      api(`/admin/winemakers/wines/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteAdminWinemakersWine: (id: string) =>
      api(`/admin/winemakers/wines/${id}`, { method: 'DELETE', credentials: 'include' }),
    getRegionsCatalog: (query?: Record<string, unknown>) =>
      api('/regions', { query }),
    getRegionCatalogItem: (slug: string) =>
      api(`/regions/${slug}`),
    getAdminWinemakersRegions: () =>
      api('/admin/winemakers/regions', { credentials: 'include' }),
    getAdminWinemakersRegion: (id: string) =>
      api(`/admin/winemakers/regions/${id}`, { credentials: 'include' }),
    createAdminWinemakersRegion: (body: Record<string, unknown>) =>
      api('/admin/winemakers/regions', { method: 'POST', body, credentials: 'include' }),
    updateAdminWinemakersRegion: (id: string, body: Record<string, unknown>) =>
      api(`/admin/winemakers/regions/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteAdminWinemakersRegion: (id: string) =>
      api(`/admin/winemakers/regions/${id}`, { method: 'DELETE', credentials: 'include' }),
    getWineriesCatalog: (query?: Record<string, unknown>) =>
      api('/wineries', { query }),
    getWineryCatalogItem: (slug: string) =>
      api(`/wineries/${slug}`),
    getAdminWinemakersWineries: () =>
      api('/admin/winemakers/wineries', { credentials: 'include' }),
    getAdminWinemakersWinery: (id: string) =>
      api(`/admin/winemakers/wineries/${id}`, { credentials: 'include' }),
    createAdminWinemakersWinery: (body: Record<string, unknown>) =>
      api('/admin/winemakers/wineries', { method: 'POST', body, credentials: 'include' }),
    updateAdminWinemakersWinery: (id: string, body: Record<string, unknown>) =>
      api(`/admin/winemakers/wineries/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteAdminWinemakersWinery: (id: string) =>
      api(`/admin/winemakers/wineries/${id}`, { method: 'DELETE', credentials: 'include' }),
    getTerroirsCatalog: (query?: Record<string, unknown>) =>
      api('/terroirs', { query }),
    getTerroirCatalogItem: (slug: string) =>
      api(`/terroirs/${slug}`),
    getAdminWinemakersTerroirs: () =>
      api('/admin/winemakers/terroirs', { credentials: 'include' }),
    getAdminWinemakersTerroir: (id: string) =>
      api(`/admin/winemakers/terroirs/${id}`, { credentials: 'include' }),
    createAdminWinemakersTerroir: (body: Record<string, unknown>) =>
      api('/admin/winemakers/terroirs', { method: 'POST', body, credentials: 'include' }),
    updateAdminWinemakersTerroir: (id: string, body: Record<string, unknown>) =>
      api(`/admin/winemakers/terroirs/${id}`, { method: 'PATCH', body, credentials: 'include' }),
    deleteAdminWinemakersTerroir: (id: string) =>
      api(`/admin/winemakers/terroirs/${id}`, { method: 'DELETE', credentials: 'include' }),
    searchWinepedia: (query?: Record<string, unknown>) =>
      api('/winepedia/search', { query }),
    getAdminComments: (query?: Record<string, unknown>) =>
      api('/admin/comments', { query, credentials: 'include' }),
    deleteAdminComment: (id: string) =>
      api(`/admin/comments/${id}`, { method: 'DELETE', credentials: 'include' }),
    getCommentStopWords: () =>
      api('/admin/comment-stop-words', { credentials: 'include' }),
    addCommentStopWord: (word: string) =>
      api('/admin/comment-stop-words', { method: 'POST', body: { word }, credentials: 'include' }),
    deleteCommentStopWord: (id: string) =>
      api(`/admin/comment-stop-words/${id}`, { method: 'DELETE', credentials: 'include' }),
    // Newsletter
    subscribeNewsletter: (email: string, topics?: string[]) =>
      api('/newsletter/subscribe', { method: 'POST', body: { email, topics } }),
    confirmNewsletter: (token: string) =>
      api('/newsletter/confirm', { query: { token } }),
    getNewsletterPreferences: (token: string) =>
      api('/newsletter/preferences', { query: { token } }),
    updateNewsletterPreferences: (token: string, body: { topics: string[]; isActive: boolean }) =>
      api('/newsletter/preferences', { method: 'POST', body: { token, ...body } }),
    unsubscribeNewsletter: (token: string) =>
      api('/newsletter/unsubscribe', { query: { token } }),
    getNewsletterSubscribers: () =>
      api('/admin/newsletter/subscribers', { credentials: 'include' }),
  };
}
