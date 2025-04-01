import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { Board } from "@/models/Board.model";
import { getUserFromHeader } from "@/lib/get.user";
import { createBoardValidation } from "@/app/validation/zod.validation";
import { ApiResponse } from "@/app/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const parsedData = createBoardValidation.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json<ApiResponse>(
        {
          error: "Credenrtials are not valid",
          data: parsedData.error.format(),
        },
        { status: 400 }
      );
    }
    const { title, description, overall_priority } = parsedData.data;
    await connectToDb();
    const existingBoard = await Board.findOne({ title, user_id: user._id });

    if (existingBoard) {
      return NextResponse.json<ApiResponse>(
        { error: "A board with this title already exists" },
        { status: 409 }
      );
    }

    const board = new Board({
      title,
      user_id: user._id,
      description,
      overall_priority,
    });

    await board.save();
    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Board created successfully", board } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
