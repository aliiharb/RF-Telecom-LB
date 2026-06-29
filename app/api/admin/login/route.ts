// Authenticates admin users and sets the protected admin session cookie.
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { findEnvAdminAccount, setAdminCookie, signAdminToken } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function verifyEnvAdmin(identifier: string, password: string) {
  const account = findEnvAdminAccount(identifier);

  if (!account) {
    return null;
  }

  if (account.passwordHash.startsWith("$2") && (await bcrypt.compare(password, account.passwordHash))) {
    return account;
  }

  if (account.password && password === account.password) {
    return account;
  }

  return null;
}

function cleanCopiedCredential(value: string) {
  const trimmedValue = value.trim();
  const copiedEnvValue = /^[A-Za-z_][A-Za-z0-9_]*\s*=/.test(trimmedValue)
    ? trimmedValue.split("=").slice(1).join("=").trim()
    : trimmedValue;
  const quote = copiedEnvValue[0];

  if (
    (quote === '"' || quote === "'") &&
    copiedEnvValue.endsWith(quote) &&
    copiedEnvValue.length >= 2
  ) {
    return copiedEnvValue.slice(1, -1);
  }

  return copiedEnvValue;
}

export async function POST(request: NextRequest) {
  const body = await readJson(request);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const identifier = cleanCopiedCredential(parsed.data.email).toLowerCase();
  const password = cleanCopiedCredential(parsed.data.password);
  const envAccount = await verifyEnvAdmin(identifier, password);

  if (envAccount) {
    const response = NextResponse.json({ ok: true });
    setAdminCookie(
      response,
      signAdminToken({
        sub: `env-admin:${envAccount.id}`,
        email: envAccount.email,
        name: envAccount.name,
        role: "ADMIN",
      }),
    );

    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
