import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Task } from "@/models/Task.model";
import { Types } from "mongoose";
import { ApiResponse } from "@/app/types/apiResponse";
import { Board } from "@/models/Board.model";

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const task_id = req.nextUrl.searchParams.get("task_id");
    const board_id = req.nextUrl.searchParams.get("board_id");

    if (!task_id || !Types.ObjectId.isValid(task_id)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid task_id is required." },
        { status: 400 }
      );
    }
    if (!board_id || !Types.ObjectId.isValid(board_id)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid board_id is required." },
        { status: 400 }
      );
    }

    await connectToDb();

    const updatedBoard = await Board.findOneAndUpdate(
      { _id: new Types.ObjectId(board_id) },
      { $pull: { task_list: new Types.ObjectId(task_id) } },
      { new: true }
    );

    if (!updatedBoard) {
      return NextResponse.json<ApiResponse>(
        { error: "Board not found." },
        { status: 404 }
      );
    }

    const result = await Task.deleteOne({
      _id: new Types.ObjectId(task_id),
      user_id: new Types.ObjectId(user._id),
      board_id: new Types.ObjectId(board_id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json<ApiResponse>(
        { error: "Task not found or you don't have permission to delete it." },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Task deleted successfully." } },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
