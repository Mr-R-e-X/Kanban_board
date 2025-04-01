import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { User } from "@/models/User.model";
import { signInValidation } from "@/app/validation/zod.validation";
import { setAuthCookie } from "@/lib/auth.cookies";
import { ApiResponse } from "@/app/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = signInValidation.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json<ApiResponse>(
        {
          error: "Credenrtials are not valid",
          data: parsedData.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = parsedData.data;

    await connectToDb();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.is_verified) {
      return NextResponse.json<ApiResponse>(
        { error: "User not verified" },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const accessToken = await user.generateAccessToken();
    await setAuthCookie(accessToken);
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          accessToken,
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
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
