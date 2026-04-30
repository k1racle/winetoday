import { registerWithEmail } from "@/lib/auth";

type RegisterPayload = {
  username?: string;
  email?: string;
  password?: string;
  displayName?: string;
};

export async function GET() {
  return Response.json({ ok: false, error: "Используйте POST для регистрации." }, { status: 405 });
}

export async function POST(request: Request) {
  let payload: RegisterPayload;

  try {
    payload = (await request.json()) as RegisterPayload;
  } catch {
    return Response.json({ ok: false, error: "Неверный JSON" }, { status: 400 });
  }

  const username = payload.username?.trim() ?? "";
  const email = payload.email?.trim().toLowerCase() ?? "";
  const password = payload.password ?? "";
  const displayName = payload.displayName?.trim() ?? "";

  if (!username || !email || !password) {
    return Response.json({ ok: false, error: "Укажите имя пользователя, email и пароль." }, { status: 400 });
  }

  try {
    const session = await registerWithEmail({ username, email, password, accountType: "subscriber", displayName });
    return Response.json({ ok: true, user: session.user, mode: session.user?.mode ?? null });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Не удалось зарегистрироваться." },
      { status: 400 },
    );
  }
}
