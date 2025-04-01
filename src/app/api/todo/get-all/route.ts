import { ApiResponse } from "@/app/types/apiResponse";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Board } from "@/models/Board.model";
import { ITask, Status } from "@/models/Task.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const board_id = searchParams.get("board_id");
    if (!board_id || !Types.ObjectId.isValid(board_id)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid board id is required." },
        { status: 400 }
      );
    }

    await connectToDb();

    const boardWithTasks = await Board.aggregate([
      {
        $match: {
          user_id: new Types.ObjectId(user._id),
          _id: new Types.ObjectId(board_id),
        },
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "board_id",
          as: "tasks",
        },
      },
      {
        $addFields: {
          tasks: { $sortArray: { input: "$tasks", sortBy: { index: 1 } } },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          tasks: 1,
        },
      },
    ]);
    if (!boardWithTasks.length) {
      return NextResponse.json<ApiResponse>(
        { error: "Board not found or you don't have access." },
        { status: 404 }
      );
    }

    const board = boardWithTasks[0];

    const categorizedTasks = board.tasks.reduce(
      (acc: Record<Status, ITask[]>, task: ITask) => {
        if (!acc[task.status]) acc[task.status] = [];
        acc[task.status].push(task);
        return acc;
      },
      {
        [Status.IN_PROGRESS]: [],
        [Status.TODO]: [],
        [Status.DONE]: [],
        [Status.SAVED_FOR_LETTER]: [],
      }
    ) as Record<Status, ITask[]>;

    const formattedBoard = {
      ...board,
      tasks: categorizedTasks,
    };
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          board: formattedBoard,
          message: "Sprint fetched successfully.",
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
