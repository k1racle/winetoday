import { d as useRuntimeConfig } from './server.mjs';

function useApi() {
  const config = useRuntimeConfig();
  const baseURL = config.apiUrl;
  const api = $fetch.create({
    baseURL,
    credentials: "include"
  });
  return {
    api,
    getContent: (query) => api("/content", { query }),
    getArticles: (query) => api("/articles", { query }),
    getArticle: (slug, preview) => api(`/articles/${slug}`, { query: preview ? { preview: true } : void 0 }),
    getNews: (query) => api("/news", { query }),
    getNewsItem: (slug, preview) => api(`/news/${slug}`, { query: preview ? { preview: true } : void 0 }),
    getVideos: (query) => api("/videos", { query }),
    getVideo: (slug, preview) => api(`/videos/${slug}`, { query: preview ? { preview: true } : void 0 }),
    getGallery: (slug, preview) => api(`/galleries/${slug}`, { query: preview ? { preview: true } : void 0 }),
    getHomepage: () => api("/homepage"),
    getCategories: () => api("/categories"),
    getTags: () => api("/tags"),
    getLatestByCategory: (limit) => api("/latest-by-category", { query: limit ? { limit } : void 0 }),
    // Admin taxonomy
    getAdminCategories: () => api("/admin/categories", { credentials: "include" }),
    createCategory: (body) => api("/admin/categories", { method: "POST", body, credentials: "include" }),
    updateCategory: (id, body) => api(`/admin/categories/${id}`, { method: "PATCH", body, credentials: "include" }),
    deleteCategory: (id) => api(`/admin/categories/${id}`, { method: "DELETE", credentials: "include" }),
    getAdminTags: () => api("/admin/tags", { credentials: "include" }),
    createTag: (body) => api("/admin/tags", { method: "POST", body, credentials: "include" }),
    updateTag: (id, body) => api(`/admin/tags/${id}`, { method: "PATCH", body, credentials: "include" }),
    deleteTag: (id) => api(`/admin/tags/${id}`, { method: "DELETE", credentials: "include" }),
    // Admin social links
    getSocialLinks: () => api("/site-settings/social-links", { credentials: "include" }),
    updateSocialLinks: (body) => api("/admin/site-settings/social-links", { method: "PATCH", body, credentials: "include" }),
    getWatermarkSettings: () => api("/settings/watermark", { credentials: "include" }),
    updateWatermarkSettings: (body) => api("/admin/settings/watermark", { method: "PATCH", body, credentials: "include" }),
    getSiteSettings: () => api("/site-settings"),
    getSiteSeo: () => api("/site-seo"),
    incrementView: (body) => api("/views/increment", { method: "POST", body }),
    login: (body) => api("/auth/login", { method: "POST", body }),
    register: (body) => api("/auth/register", { method: "POST", body }),
    logout: () => api("/auth/logout", { method: "POST" }),
    me: () => api("/auth/me"),
    getUsers: () => api("/admin/users", { credentials: "include" }),
    getUser: (id) => api(`/admin/users/${id}`, { credentials: "include" }),
    createUser: (body) => api("/admin/users", { method: "POST", body, credentials: "include" }),
    updateUser: (id, body) => api(`/admin/users/${id}`, { method: "PATCH", body, credentials: "include" }),
    deleteUser: (id) => api(`/admin/users/${id}`, { method: "DELETE", credentials: "include" }),
    updateUserRole: (id, role) => api(`/admin/users/${id}/role`, { method: "PATCH", body: { role }, credentials: "include" }),
    getMediaById: (id) => api(`/media/${id}`, { credentials: "include" }),
    uploadMedia: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return api("/media/upload", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
    },
    uploadCoverMedia: (file, watermark = false) => {
      const formData = new FormData();
      formData.append("file", file);
      return api("/media/cover", {
        method: "POST",
        query: watermark ? { watermark: "true" } : void 0,
        body: formData,
        credentials: "include"
      });
    },
    saveDraft: (body) => api("/editor/drafts", { method: "POST", body, credentials: "include" }),
    getDraft: (id) => api(`/editor/drafts/${id}`, { credentials: "include" }),
    getEditorMaterials: (query) => api("/editor/materials", { query, credentials: "include" }),
    getAuthors: () => api("/editor/authors", { credentials: "include" }),
    getAdminAuthors: () => api("/admin/authors", { credentials: "include" }),
    getAuthorAnalytics: (id) => api(`/admin/authors/${id}/analytics`, { credentials: "include" })
  };
}

export { useApi as u };
//# sourceMappingURL=useApi-Bz4iiPAp.mjs.map
