import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { Board } from "@/models/Board.model";
import { getUserFromHeader } from "@/lib/get.user";
import { Task } from "@/models/Task.model";
import { ApiResponse } from "@/app/types/apiResponse";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const board_id = req.nextUrl.searchParams.get("board_id");
    if (!board_id) {
      return NextResponse.json<ApiResponse>(
        { error: "Board id is required" },
        { status: 400 }
      );
    }
    await connectToDb();
    const board = await Board.findOne({ _id: board_id, user_id: user._id });
    if (!board) {
      return NextResponse.json(
        { error: "Board not found or unauthorized" },
        { status: 404 }
      );
    }
    await Task.deleteMany({ board_id });
    await Board.findByIdAndDelete(board_id);
    return NextResponse.json(
      { message: "Board and associated tasks deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
