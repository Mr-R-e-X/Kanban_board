import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { User } from "@/models/User.model";
import { verifyCodeValidation } from "@/app/validation/zod.validation";
import { getCookieByCookieName, setAuthCookie } from "@/lib/auth.cookies";
import { ApiResponse } from "@/app/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = verifyCodeValidation.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json<ApiResponse>(
        {
          error: "Credenrtials are not valid",
          data: parsedData.error.format(),
        },
        { status: 400 }
      );
    }

    const { code } = parsedData.data;
    const cookie = await getCookieByCookieName("acccessToken");

    if (!cookie) {
      return NextResponse.json<ApiResponse>(
        { error: "Access token not found" },
        { status: 401 }
      );
    }
    const decoded = jwt.verify(
      cookie,
      process.env.JWT_SECRET_FOR_ACCESS_TOKEN!
    ) as JwtPayload;
    if (!decoded) {
      return NextResponse.json<ApiResponse>(
        { error: "Request forget, generate token again" },
        { status: 401 }
      );
    }

    const _id = decoded._id;
    await connectToDb();
    const user = await User.findById(_id);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.is_verified) {
      return NextResponse.json<ApiResponse>(
        { error: "User already verified" },
        { status: 400 }
      );
    }

    const currentTime = new Date();
    const verifyCodeExpiry = new Date(user.verify_code_expiry);

    if (currentTime > verifyCodeExpiry) {
      return NextResponse.json<ApiResponse>(
        { error: "Verification code expired, please generate a new code" },
        { status: 400 }
      );
    }

    if (user.verify_code !== code) {
      return NextResponse.json<ApiResponse>(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    user.is_verified = true;
    user.verify_code_expiry = null;
    await user.save();

    const accessToken = await user.generateAccessToken();
    setAuthCookie(accessToken);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: "User verified successfully",
        accessToken,
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          profile_image: user?.profile_image,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
