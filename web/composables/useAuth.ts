import type { Ref } from 'vue';

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  displayName?: string | null;
  role: string;
  avatarMedia?: { id?: string; path?: string | null } | null;
}

export interface RegisterBody {
  username: string;
  displayName?: string;
  email: string;
  password: string;
}

function isUnauthorized(err: unknown): boolean {
  const status = (err as any)?.status ?? (err as any)?.response?.status ?? (err as any)?.statusCode;
  return status === 401;
}

// Единый in-flight refresh на вкладку: параллельные вызовы (интервал, middleware,
// плагин) ждут один и тот же запрос вместо гонки за ротацией refresh-токена.
let refreshInFlight: Promise<boolean> | null = null;

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null);
  const { login, register, logout, me, refresh } = useApi();

  async function fetchUser() {
    try {
      const data = await me();
      user.value = data as AuthUser;
      return data;
    } catch (err) {
      // Разлогиниваем только при 401. 429/500/сеть — временные проблемы,
      // пользователь остаётся залогиненным (cookie валидны).
      if (isUnauthorized(err)) {
        user.value = null;
        return null;
      }
      return user.value;
    }
  }

  async function signIn(loginValue: string, password: string) {
    await login({ login: loginValue, password });
    return fetchUser();
  }

  async function signUp(body: RegisterBody) {
    await register(body);
  }

  async function signOut() {
    try {
      await logout();
    } catch {
      // игнорируем — локально разлогиниваемся в любом случае
    } finally {
      user.value = null;
    }
  }

  async function doRefresh(): Promise<boolean> {
    try {
      await refresh();
      await fetchUser();
      return true;
    } catch (err) {
      // Другая вкладка могла уже успеть сменить refresh-токен (ротация) —
      // тогда новые cookie уже на месте, достаточно перечитать пользователя.
      const restored = await fetchUser();
      if (restored) return true;
      if (isUnauthorized(err)) {
        user.value = null;
      }
      return false;
    }
  }

  async function refreshToken() {
    if (!refreshInFlight) {
      refreshInFlight = doRefresh().finally(() => {
        refreshInFlight = null;
      });
    }
    return refreshInFlight;
  }

  return {
    user: user as Ref<AuthUser | null>,
    fetchUser,
    signIn,
    signUp,
    signOut,
    refreshToken,
    isAuthenticated: computed(() => !!user.value),
  };
}
