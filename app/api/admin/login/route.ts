// Authenticates admin users and sets the protected admin session cookie.
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { findEnvAdminAccount, setAdminCookie, signAdminToken } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const identifier = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  let user = null;

  try {
    user = await prisma.user.findUnique({ where: { email: identifier } });
  } catch (error) {
    logger.error("AdminLogin", "Failed to query admin user table.", error);
  }

  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    const response = NextResponse.json({ ok: true });
    setAdminCookie(
      response,
      signAdminToken({
        sub: user.id,
        email: user.email,
        role: "ADMIN",
      }),
    );

    return response;
  }

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
