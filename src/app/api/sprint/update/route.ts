import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { Board } from "@/models/Board.model";
import { getUserFromHeader } from "@/lib/get.user";
import { ApiResponse } from "@/app/types/apiResponse";
import { Types } from "mongoose";
import { updateBoardValidation } from "@/app/validation/zod.validation";

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const parsedData = updateBoardValidation.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json<ApiResponse>(
        {
          error: "Credenrtials are not valid",
          data: parsedData.error.format(),
        },
        { status: 400 }
      );
    }
    const { _id, title, description, overall_priority } = parsedData.data;
    if (!_id || !Types.ObjectId.isValid(_id)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid board id is required." },
        { status: 400 }
      );
    }
    await connectToDb();
    const board = await Board.findOne({
      _id: new Types.ObjectId(_id),
      user_id: new Types.ObjectId(user._id),
    });
    if (!board) {
      return NextResponse.json<ApiResponse>(
        { error: "Board not found or unauthorized" },
        { status: 404 }
      );
    }
    board.title = title;
    board.description = description;
    board.overall_priority = overall_priority;
    await board.save();
    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Board updated successfully" } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
