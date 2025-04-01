import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db.connect";
import { Priority, Status, Task } from "@/models/Task.model";
import { Board } from "@/models/Board.model";
import { getUserFromHeader } from "@/lib/get.user";
import { ApiResponse } from "@/app/types/apiResponse";
import { createTaskValidation } from "@/app/validation/zod.validation";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromHeader(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = createTaskValidation.safeParse({
      ...body,
      start_date: body.start_date || null,
      due_date: body.due_date || null,
    });

    if (!parsedData.success) {
      return NextResponse.json<ApiResponse>(
        {
          error: "Credenrtials are not valid",
          data: parsedData.error.format(),
        },
        { status: 400 }
      );
    }
    const {
      title,
      description,
      priority,
      status,
      start_date,
      due_date,
      board_id,
      board_name,
    } = parsedData.data;

    await connectToDb();

    const board = await Board.findById(board_id);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    const task = new Task({
      title,
      description,
      priority: priority || Priority.LOW,
      status: status || Status.TODO,
      start_date: start_date ? new Date(start_date) : null,
      due_date: due_date ? new Date(due_date) : null,
      user_id: user._id,
      board_id: board_id,
    });
    await task.save();
    board.task_list.push(task._id);
    await board.save();
    return NextResponse.json<ApiResponse>(
      { success: true, data: { message: "Task created successfully" } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
