import { loginWithIdentifier } from "@/lib/auth";

type LoginPayload = {
  identifier?: string;
  password?: string;
};

export async function GET() {
  return Response.json({ ok: false, error: "Используйте POST для входа." }, { status: 405 });
}

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return Response.json({ ok: false, error: "Неверный JSON" }, { status: 400 });
  }

  const identifier = payload.identifier?.trim() ?? "";
  const password = payload.password ?? "";

  if (!identifier || !password) {
    return Response.json({ ok: false, error: "Укажите email или логин и пароль." }, { status: 400 });
  }

  try {
    const session = await loginWithIdentifier(identifier, password);
    return Response.json({ ok: true, user: session.user, mode: session.user?.mode ?? null });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Не удалось войти." },
      { status: 401 },
    );
  }
}
