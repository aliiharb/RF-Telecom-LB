import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAuthSecret } from "@/lib/env";

export const ADMIN_COOKIE = "rf_admin_token";

export type AdminSession = {
  sub: string;
  email: string;
  name?: string;
  role: "ADMIN";
};

export const ENV_ADMIN_SUBJECT = "env-admin";

function normalizeEmail(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

export function getEnvAdminEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL);
}

export type EnvAdminAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  passwordHash: string;
};

export function getEnvAdminAccounts(): EnvAdminAccount[] {
  const legacyEmail = getEnvAdminEmail();
  const legacyPassword = process.env.ADMIN_PASSWORD || "";
  const legacyPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

  return [
    {
      id: "site",
      name: "Site",
      email: "rftelecomlb.com",
      password: "admin",
      passwordHash: "",
    },
    {
      id: "ali",
      name: "Ali",
      email: normalizeEmail(process.env.ADMIN_ALI_EMAIL || "ali@rftelecomlb.com"),
      password: process.env.ADMIN_ALI_PASSWORD || legacyPassword,
      passwordHash: process.env.ADMIN_ALI_PASSWORD_HASH || "",
    },
    {
      id: "zahraa",
      name: "Zahraa",
      email: normalizeEmail(process.env.ADMIN_ZAHRAA_EMAIL || "zahraa@rftelecomlb.com"),
      password: process.env.ADMIN_ZAHRAA_PASSWORD || legacyPassword,
      passwordHash: process.env.ADMIN_ZAHRAA_PASSWORD_HASH || "",
    },
    legacyEmail
      ? {
          id: "main",
          name: "Admin",
          email: legacyEmail,
          password: legacyPassword,
          passwordHash: legacyPasswordHash,
        }
      : null,
  ].filter((account): account is EnvAdminAccount => Boolean(account?.email));
}

export function findEnvAdminAccount(identifier: string) {
  const normalized = normalizeEmail(identifier);

  return getEnvAdminAccounts().find(
    (account) =>
      account.email === normalized ||
      account.id === normalized ||
      account.name.toLowerCase() === normalized,
  );
}

function getEnvAdminSubject(account: EnvAdminAccount) {
  return `${ENV_ADMIN_SUBJECT}:${account.id}`;
}

export function signAdminToken(session: AdminSession) {
  return jwt.sign(session, getAuthSecret(), { expiresIn: "7d" });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, getAuthSecret()) as AdminSession;

    if (decoded.sub.startsWith(`${ENV_ADMIN_SUBJECT}:`) || decoded.sub === ENV_ADMIN_SUBJECT) {
      const account = getEnvAdminAccounts().find(
        (item) =>
          getEnvAdminSubject(item) === decoded.sub ||
          (decoded.sub === ENV_ADMIN_SUBJECT && item.email === normalizeEmail(decoded.email)),
      );

      if (account && normalizeEmail(decoded.email) === account.email) {
        return {
          sub: decoded.sub === ENV_ADMIN_SUBJECT ? ENV_ADMIN_SUBJECT : getEnvAdminSubject(account),
          email: account.email,
          name: account.name,
          role: "ADMIN",
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireAdminApi() {
  const session = await getAdminSession();

  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, response: null };
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
