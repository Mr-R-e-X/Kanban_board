import { ApiResponse } from "@/app/types/apiResponse";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Board } from "@/models/Board.model";
import { Task } from "@/models/Task.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { boardId, tasks } = await req.json();

    if (!boardId || !Types.ObjectId.isValid(boardId)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid board id is required." },
        { status: 400 }
      );
    }

    if (!tasks || !Array.isArray(tasks) || tasks?.length === 0) {
      return NextResponse.json<ApiResponse>(
        { error: "Array of tasks is required." },
        { status: 400 }
      );
    }
    await connectToDb();
    const bulkOperations = tasks.map((task) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(task._id),
          board_id: new Types.ObjectId(boardId),
        },
        update: {
          $set: {
            status: task.status,
            index: task.index,
            isCompleted: task.status === "DONE",
          },
        },
      },
    }));

    await Task.bulkWrite(bulkOperations);

    const completedIds = await Task.aggregate([
      {
        $match: {
          board_id: new Types.ObjectId(boardId),
          user_id: new Types.ObjectId(user._id),
          isCompleted: true,
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    await Board.findOneAndUpdate(
      {
        _id: new Types.ObjectId(boardId),
        user_id: new Types.ObjectId(user._id),
      },
      {
        $set: {
          completed_task_list: completedIds.map((task) => task._id),
        },
      },
      { new: true }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { message: "Tasks updated successfully" },
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
