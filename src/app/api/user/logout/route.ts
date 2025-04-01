import { ApiResponse } from "@/app/types/apiResponse";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth.cookies";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDb();
    await setAuthCookie("", "acccessToken", 0);

    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Loggedout successfully" } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
