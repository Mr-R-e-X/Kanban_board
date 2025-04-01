import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { User } from "@/models/User.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "@/app/types/apiResponse";
import { getCookieByCookieName, setAuthCookie } from "@/lib/auth.cookies";

export async function POST(req: NextRequest) {
  try {
    const { accessToken: bodyToken } = await req.json();
    const accessToken = await getCookieByCookieName("acccessToken");
    if (!accessToken && !bodyToken)
      return NextResponse.json<ApiResponse>(
        { error: "Please sign in or register" },
        { status: 400 }
      );
    const decodedToken = jwt.verify(
      accessToken ? accessToken : bodyToken,
      process.env.JWT_SECRET_FOR_ACCESS_TOKEN!
    ) as JwtPayload;
    if (!decodedToken)
      return NextResponse.json<ApiResponse>(
        { error: "Token expired or invalid, Please sign in or register." },
        { status: 400 }
      );
    await connectToDb();
    const user = await User.findOne({ _id: decodedToken._id });
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "User not found" },
        { status: 404 }
      );
    }
    const token = await user.generateAccessToken();
    await setAuthCookie(token);
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          accessToken: token,
          user: {
            name: user.name,
            email: user.email,
            _id: user._id,
            profile_image: user?.profile_image,
          },
          message: `Welcome ${user.name} !`,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Token Expired" },
      { status: error.status || 500 }
    );
  }
}
