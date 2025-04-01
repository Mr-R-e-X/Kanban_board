import { getCookieByCookieName } from "./auth.cookies";

export const verifyRequest = async (request: Request) => {
  try {
    const token =
      (await getCookieByCookieName("acccessToken")) ||
      request.headers.get("accessToken");

    if (!token) return null;
    return token;
  } catch (error: any) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
};
