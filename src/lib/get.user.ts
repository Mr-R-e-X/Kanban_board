import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@/models/User.model";

export interface DecodedToken extends JwtPayload {
  _id: string;
  profile_image: string;
}

export const getUserFromHeader = async (
  request: NextRequest
): Promise<DecodedToken | null> => {
  try {
    const header = request.headers.get("x-access-token");
   
    if (!header) {
      return null;
    }
    const user = jwt.verify(
      header,
      process.env.JWT_SECRET_FOR_ACCESS_TOKEN!
    ) as DecodedToken;
    if (!user) return null;
    const isExists = await User.exists({ _id: user._id });
    if (!isExists) return null;
    else return user;
  } catch (error) {
    return null;
  }
};
