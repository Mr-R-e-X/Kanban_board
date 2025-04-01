import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { User } from "@/models/User.model";
import { generateRandomSixDigitVerifyCode } from "@/helper/helper";
import { sendMail } from "@/lib/mailer";
import { signUpValidation } from "@/app/validation/zod.validation";
import { ApiResponse } from "@/app/types/apiResponse";
import { setAuthCookie } from "@/lib/auth.cookies";
import { generateKanbanEmailTemplate } from "@/templates/SendToken.mail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = signUpValidation.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json<ApiResponse>(
        {
          error: "Credenrtials are not valid",
          data: parsedData.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsedData.data;
    await connectToDb();
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.is_verified) {
      const accessToken = existingUser.generateAccessToken();
      setAuthCookie(accessToken);
      return NextResponse.json<ApiResponse>(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const verify_code = generateRandomSixDigitVerifyCode();
    const verify_code_expiry = new Date(Date.now() + 15 * 60 * 1000);

    if (existingUser && !existingUser.is_verified) {
      existingUser.verify_code = verify_code;
      existingUser.verify_code_expiry = verify_code_expiry;
      existingUser.password = password;
      existingUser.name = name;
      await existingUser.save();

      sendMail([email], "Verify your account", `<h1>${verify_code}</h1>`);
      const accessToken = await existingUser.generateAccessToken();
      const cookiestring = await setAuthCookie(accessToken);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            message:
              "Email already exists , please verify your account using OTP",
          },
        },
        { status: 200 }
      );
    }

    const user = new User({
      name,
      email,
      password,
      verify_code,
      verify_code_expiry,
    });
    await user.save();
    const template = generateKanbanEmailTemplate(user.name, user.verify_code);
    sendMail([email], "Verify your account", template);
    const accessToken = await user.generateAccessToken();
    await setAuthCookie(accessToken);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: "Please check your email to complete the registration.",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Failed to register user" },
      { status: error?.status || 500 }
    );
  }
}
