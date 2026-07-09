import { computed, toRef, isRef } from 'vue';
import { a as useRuntimeConfig, g as useNuxtApp } from './server.mjs';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
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
    getAuthor: (slug) => api(`/authors/${slug}`),
    getAuthorContent: (slug) => api(`/authors/${slug}/content`),
    getAuthorSubscription: (slug) => api(`/authors/${slug}/subscription`),
    subscribeToAuthor: (slug) => api(`/authors/${slug}/subscribe`, { method: "POST", credentials: "include" }),
    unsubscribeFromAuthor: (slug) => api(`/authors/${slug}/unsubscribe`, { method: "DELETE", credentials: "include" }),
    updateAuthor: (id, body) => api(`/admin/authors/${id}`, { method: "PATCH", body, credentials: "include" }),
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
    getReactions: (contentItemId, viewerId) => api(`/content/${contentItemId}/reactions`, { query: viewerId ? { viewerId } : void 0 }),
    react: (contentItemId, type, viewerId) => api(`/content/${contentItemId}/react`, { method: "POST", body: { type, viewerId }, credentials: "include" }),
    getComments: (contentItemId) => api(`/content/${contentItemId}/comments`),
    createComment: (contentItemId, body) => api(`/content/${contentItemId}/comments`, { method: "POST", body: { body }, credentials: "include" }),
    login: (body) => api("/auth/login", { method: "POST", body }),
    register: (body) => api("/auth/register", { method: "POST", body }),
    logout: () => api("/auth/logout", { method: "POST" }),
    me: () => api("/auth/me"),
    getMySubscriptions: () => api("/auth/me/subscriptions", { credentials: "include" }),
    getMyLikes: () => api("/auth/me/likes", { credentials: "include" }),
    getMyComments: () => api("/auth/me/comments", { credentials: "include" }),
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
function useAuth() {
  const user = useState("auth-user", () => null);
  const { login, register, logout, me } = useApi();
  async function fetchUser() {
    try {
      const data = await me();
      user.value = data;
      return data;
    } catch {
      user.value = null;
      return null;
    }
  }
  async function signIn(loginValue, password) {
    await login({ login: loginValue, password });
    return fetchUser();
  }
  async function signUp(body) {
    await register(body);
  }
  async function signOut() {
    await logout();
    user.value = null;
  }
  return {
    user,
    fetchUser,
    signIn,
    signUp,
    signOut,
    isAuthenticated: computed(() => !!user.value)
  };
}

export { useAuth as a, useApi as u };
//# sourceMappingURL=useAuth-8H_2G1XE.mjs.map
