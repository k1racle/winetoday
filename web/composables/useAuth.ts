import type { Ref } from 'vue';

export interface AuthUser {
  id: string;
  email: string;
  username?: string | null;
  displayName?: string | null;
  role: string;
}

export interface RegisterBody {
  username: string;
  displayName?: string;
  email: string;
  password: string;
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null);
  const { login, register, logout, me } = useApi();

  async function fetchUser() {
    try {
      const data = await me();
      user.value = data as AuthUser;
      return data;
    } catch {
      user.value = null;
      return null;
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
    await logout();
    user.value = null;
  }

  return {
    user: user as Ref<AuthUser | null>,
    fetchUser,
    signIn,
    signUp,
    signOut,
    isAuthenticated: computed(() => !!user.value),
  };
}
