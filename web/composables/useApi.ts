export function useApi() {
  const config = useRuntimeConfig();

  const baseURL = import.meta.server ? config.apiUrl : config.public.apiUrl;

  const api = $fetch.create({
    baseURL,
    credentials: 'include',
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
    getNewsItem: (slug: string) =>
      api(`/news/${slug}`),
    getVideos: (query?: Record<string, unknown>) =>
      api('/videos', { query }),
    getVideo: (slug: string) =>
      api(`/videos/${slug}`),
    getHomepage: () =>
      api('/homepage'),
    getCategories: () =>
      api('/categories'),
    getTags: () =>
      api('/tags'),
    getLatestByCategory: (limit?: number) =>
      api('/latest-by-category', { query: limit ? { limit } : undefined }),
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
    getSiteSeo: () =>
      api('/site-seo'),
    incrementView: (body: Record<string, unknown>) =>
      api('/views/increment', { method: 'POST', body }),
    login: (body: { login: string; password: string }) =>
      api('/auth/login', { method: 'POST', body }),
    register: (body: { username: string; displayName?: string; email: string; password: string }) =>
      api('/auth/register', { method: 'POST', body }),
    logout: () =>
      api('/auth/logout', { method: 'POST' }),
    me: () =>
      api('/auth/me'),
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
    uploadMedia: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api('/media/upload', {
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
    getAuthors: () =>
      api('/editor/authors', { credentials: 'include' }),
    getAdminAuthors: () =>
      api('/admin/authors', { credentials: 'include' }),
  };
}
