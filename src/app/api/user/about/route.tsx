import { ApiResponse } from "@/app/types/apiResponse";
import { connectToDb } from "@/lib/db.connect";
import { getUserFromHeader } from "@/lib/get.user";
import { Priority, Status, Task } from "@/models/Task.model";
import { User } from "@/models/User.model";
import { Board } from "@/models/Board.model";
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

    await connectToDb();

    const [userD, tasks, boards] = await Promise.all([
      User.findById(user._id, "email name"),
      Task.find({ user_id: new Types.ObjectId(user._id) }),
      Board.find({ user_id: new Types.ObjectId(user._id) }),
    ]);

    const totalBoards = boards.length;
    const totalTasks = tasks.length;

    const taskStats = tasks.reduce(
      (acc, task) => {
        acc[`total${task.status}`]++;
        acc[`total${task.priority}Task`]++;

        if (task.status === Status.TODO || task.status === Status.IN_PROGRESS) {
          acc[`total${task.priority}PendingTask`]++;
        } else if (task.status === Status.DONE) {
          acc[`total${task.priority}DoneTask`]++;
        }

        return acc;
      },
      {
        totalTODO: 0,
        totalIN_PROGRESS: 0,
        totalDONE: 0,
        totalSAVED_FOR_LETTER: 0,
        totalUrgentTask: 0,
        totalHighTask: 0,
        totalMediumTask: 0,
        totalLowTask: 0,
        totalUrgentPendingTask: 0,
        totalUrgentDoneTask: 0,
        totalHighPendingTask: 0,
        totalHighDoneTask: 0,
        totalMediumPendingTask: 0,
        totalMediumDoneTask: 0,
        totalLowPendingTask: 0,
        totalLowDoneTask: 0,
      }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        message: "User details fetched successfully",
        totalBoards,
        totalTasks,
        totalTodo: taskStats.totalTODO,
        totalInProgress: taskStats.totalIN_PROGRESS,
        totalDone: taskStats.totalDONE,
        totalSavedForLater: taskStats.totalSAVED_FOR_LETTER,
        totalUrgentTask: taskStats.totalUrgentTask,
        totalHighTask: taskStats.totalHighTask,
        totalMediumTask: taskStats.totalMediumTask,
        totalLowTask: taskStats.totalLowTask,
        totalUrgentPendingTask: taskStats.totalUrgentPendingTask,
        totalUrgentDoneTask: taskStats.totalUrgentDoneTask,
        totalMediumPendingTask: taskStats.totalMediumPendingTask,
        totalMediumDoneTask: taskStats.totalMediumDoneTask,
        totalLowPendingTask: taskStats.totalLowPendingTask,
        totalLowDoneTask: taskStats.totalLowDoneTask,
        totalHighPendingTask: taskStats.totalHighPendingTask,
        totalHighDoneTask: taskStats.totalHighDoneTask,
        userEmail: userD?.email || "",
        userName: userD?.name || "",
      },
    });
  } catch (error: any) {
    return NextResponse.json<ApiResponse>(
      { error: error?.message || "Something went wrong" },
      { status: error?.status || 500 }
    );
  }
}
