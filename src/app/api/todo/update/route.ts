import { ApiResponse } from "@/app/types/apiResponse";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Board } from "@/models/Board.model";
import { Status, Task } from "@/models/Task.model";
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

    const {
      task_id,
      title,
      description,
      priority,
      status,
      start_date,
      due_date,
      board_id,
    } = await req.json();

    console.log(
      task_id,
      title,
      description,
      priority,
      status,
      start_date,
      due_date,
      board_id
    );

    if (!task_id || !Types.ObjectId.isValid(task_id)) {
      return NextResponse.json<ApiResponse>(
        { error: "Valid Task ID is required" },
        { status: 400 }
      );
    }

    await connectToDb();

    const query: Record<string, any> = {};

    if (title) query.title = title;
    if (description) query.description = description;
    if (priority) query.priority = priority;
    if (status) query.status = status;
    if (start_date) query.start_date = new Date(start_date);
    if (due_date) query.due_date = new Date(due_date);
    if (board_id && Types.ObjectId.isValid(board_id)) {
      query.board_id = new Types.ObjectId(board_id);
    }

    if (Object.keys(query).length === 0) {
      return NextResponse.json(
        { error: "At least one field is required to update." },
        { status: 400 }
      );
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: new Types.ObjectId(task_id),
        board_id: new Types.ObjectId(board_id),
        user_id: new Types.ObjectId(user._id),
      },
      { $set: query },
      { new: true }
    );

    if (!task) {
      return NextResponse.json<ApiResponse>(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const boardUpdate =
      task.status === Status.DONE
        ? {
            $pull: { task_list: task._id },
            $addToSet: { completed_task_list: task._id },
          }
        : {
            $addToSet: { task_list: task._id },
            $pull: { completed_task_list: task._id },
          };

    await Board.findOneAndUpdate(
      {
        _id: new Types.ObjectId(task.board_id),
        user_id: new Types.ObjectId(user._id),
      },
      boardUpdate,
      { new: true }
    );

    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Task updated successfully", task } },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
