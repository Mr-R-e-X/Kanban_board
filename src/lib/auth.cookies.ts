"use server";

import { cookies } from "next/headers";

export const setAuthCookie = async (
  token: string,
  COOKIE_NAME: string = "acccessToken",
  maxAge: number = 60 * 60 * 24 * 2
) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    maxAge: maxAge,
    path: "/",
  });
  return cookieStore;
};

export const getCookieByCookieName = async (cookieName: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value;
};
