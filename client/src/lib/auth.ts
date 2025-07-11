import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function getSessionToken(){
  const cookieStore = await cookies();

  const cookieHeader = cookieStore.getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  // Manually construct a fake NextRequest-like object
  const req = {
    headers: {
      get(header: string) {
        if (header.toLowerCase() === "cookie") return cookieHeader;
        return null;
      },
    },
  };

  const token = await getToken({
    req: req as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return token;
}
