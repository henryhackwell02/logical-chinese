import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "lc_admin";

export function isAdmin(): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return cookies().get(COOKIE_NAME)?.value === password;
}

export function setAdminCookie(password: string) {
  cookies().set(COOKIE_NAME, password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: "/",
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && password === expected;
}
