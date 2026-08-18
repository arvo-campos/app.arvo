import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "arvo_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 dias

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não está configurado no .env");
  }
  return new TextEncoder().encode(secret);
}

export type Role = "admin" | "cliente";

export type Session = {
  userId: string;
  nome: string;
  role: Role;
  clienteId: string | null;
};

export async function hashPassword(senha: string) {
  return bcrypt.hash(senha, 10);
}

export async function verifyPassword(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export async function createSessionCookie(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      nome: payload.nome as string,
      role: payload.role as Role,
      clienteId: (payload.clienteId as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/meus-eventos");
  return session;
}

export async function requireCliente(): Promise<Session> {
  const session = await requireSession();
  if (session.role !== "cliente") redirect("/dashboard");
  return session;
}

export function homePathForRole(_role: Role) {
  return "/dashboard";
}
