export function useApi() {
  const config = useRuntimeConfig();

  const baseURL = import.meta.server ? config.apiUrl : config.public.apiUrl;
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : {};

  const api = $fetch.create({
    baseURL,
    credentials: 'include',
    headers,
  });

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
  };
}
